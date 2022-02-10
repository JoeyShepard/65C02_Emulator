
/*Limitations:
1. No wrapping at 64k boundary
2. No wrapping in zero page mode
	Did Klaus suite test for this?
3. BRK doesn't push anything
4. Interrupts?
5. *IMPORTANT!: When clock rate drops, approaches 50mhz, which is holey array speed!!!!
*/

/*Improvements:
1. Change cycle count below to make faster
2. make two versions of bank where only one has CalcBanked calculation
*/


//***********
//*CONSTANTS*
//***********

//RAM and ROM banks (16k chunks)
const BANK_SIZE=		0x4000;
const BANK_COUNT=		16;
const BANK_GEN_RAM1=	0;		//0-16k
const BANK_GEN_RAM2=	1;		//16-32k
const BANK_GEN_RAM3=	2;		//32-48k
const BANK_GEN_RAM4=	3;		//48-64k
const BANK_GFX_RAM1=	4;		//64k-92k	(2 banks)
const BANK_GFX_RAM2=	5;
//Room for more banks			//92k-224k
const BANK_GEN_ROM=		14;		//224k-256k	(2 banks)

//Graphics memory
const GFX_MEM_BEGIN=BANK_GFX_RAM1*BANK_SIZE;
const GFX_MEM_SIZE=BANK_SIZE*2;
const GFX_MEM_END=GFX_MEM_BEGIN+GFX_MEM_SIZE;

//Peripheral addresses
const PERIPHERALS_BEGIN=0xFFE0;	//Beginning address of peripherals
const RAM_BANK1=		0xFFE0;	//0x200-0x3FFF
const RAM_BANK2=		0xFFE1;	//0x4000-0x7FFF
const RAM_BANK3=		0xFFE2;	//0x8000-0xBFFF
const ROM_BANK=			0xFFE3;	//0xC000-0xFFFF
const KB_INPUT=			0xFFE4;
const TIMER_MS4=		0xFFE5;	//Current milliseconds divided by 4
const TIMER_S=			0xFFE6;	//Current seconds
const DEBUG=			0xFFE7; //Debug log in Calculator information
const DEBUG_HEX=		0xFFE8; //Hex output in debug log
const DEBUG_DEC=		0xFFE9; //Decimal output in debug log
const DEBUG_DEC16=		0xFFEA; //Decimal output in debug log
const DEBUG_TIMING =	0xFFEB;	//Instruction and ms timing
const LOG_ON =			0xFFEC; //Turn instruction logging on
const LOG_OFF = 		0xFFED; //Turn instruction logging off
const LOG_SEND =		0xFFEE; //Send instruction log file
const BELL_SOUND =		0xFFEF; //Play bell sound on printing character 7
const FILE_INPUT =		0xFFF0; //Play bell sound on printing character 7

//Commands for DEBUG_TIMING peripheral
const TIMING_INSTR_BEGIN =	1
const TIMING_INSTR_END =	2
const TIMING_INSTR_RESET =	3
const TIMING_TIME_BEGIN =	4
const TIMING_TIME_END =		5
const TIMING_TIME_RESET =	6
const TIMING_ECHO_ON =		7
const TIMING_ECHO_OFF =		8

//******************
//*GLOBAL VARIABLES*
//******************

var loaded=0;

var PC=0xC000;
var A=0;
var X=0;
var Y=0;
var SP=0xFF;
var FlagC=0;
var FlagZ=0;
var FlagI=1;	//Off
var FlagD=0;	
var FlagB=1;	//Always set?
var FlagV=0;
var FlagN=0;

var RamBank1=0;
var RamBank2=0;
var RamBank3=0;
//var RomBank=0;
var RomBank=BANK_SIZE*3;	//Point to 0xC000-0xFFFF on startup

//Typed arrays might be even faster

//All variants with bank set to premature return
//Variant 1							50mhz
//var mem=[];
//Variant 2							67mhz
//var mem=[];
//mem.length=0x40000;					
//Variant 3							67mhz
//var mem=new Array(0x40000);
//Variant 4							69mhz (65mhz with banking)
//var mem=new Array(0x40000).fill(0);	
//Variant 5
var mem=new Uint8Array(0x40000);
var running=0;
var cycle_count=0;
var cycle_penalty=0;
var CalcAddress=-1;
var tempCalcBanked=-1;
var CalcBanked=-1;
var debugflag;
var ScreenDirty;
var keyBuffer=[];
var inputBuffer=[];
var debugBuffer=[];
var timingEcho=true;
var timingCycles=0;
var timingTime=0;

var cycleLog="";
var cycleLogActivated=false;

//Wait for top level html to pass path of hex file
//setup();
//Initialize message loop here instead of setup
self.addEventListener('message', OnMessage , false);


//**********************************
//*FUNCTIONS FOR RUNNING CPU CYCLES*
//**********************************

//https://stackoverflow.com/questions/31439286/does-javascript-have-anything-similar-to-vbas-doevents
function* cycle10_6()
{
	do
	{	
		//for (i=0;i<1000000;i++) //works but typing is slow
		for (i=0;i<100000;i++) //more responsive?
			if (running==1)
			{
				CalcAddress=-1;
				if (cycleLogActivated) recordCycle();
				else opList[mem[bank(PC++)]]();
			}
		yield;
	} while(true);
}

var cycleGen=cycle10_6();

function cycleFunc()
{
	var obj=cycleGen.next();
	if ((obj.done==false)&&(running==1)) setTimeout(cycleFunc, 0);
}

function recordCycle()
{
	//cycleLog+=cycle_count.toString().toUpperCase().padStart(12,"0")+"  ";
	cycleLog+=PC.toString(16).toUpperCase().padStart(4,"0")+"  ";
	const PC_start=PC;
	const op=mem[bank(PC)];
	opList[mem[bank(PC++)]]();
	let cycleTemp="";
	let cycleBytes=[];
	for (let i=0;i<opLens[mem[bank(PC_start)]];i++)
	{
		cycleBytes.push(mem[bank(PC_start+i)]);
		cycleTemp+=mem[bank(PC_start+i)].toString(16).padStart(2,"0")+" ";
	}
	cycleLog+=cycleTemp.toUpperCase().padEnd(10," ");
	cycleLog+=disassemble(cycleBytes);
	cycleLog+="A:"+A.toString(16).toUpperCase().padStart(2,"0")+" ";
	if ((A>=" ".charCodeAt(0))&&(A<="~".charCodeAt(0))) cycleLog+="("+String.fromCharCode(A)+") ";
	else cycleLog+="( ) ";
	cycleLog+="X:"+X.toString(16).toUpperCase().padStart(2,"0")+" ";
	cycleLog+="Y:"+Y.toString(16).toUpperCase().padStart(2,"0")+" ";
	cycleLog+="SP:"+SP.toString(16).toUpperCase().padStart(2,"0")+" ";
	if (CalcAddress==-1) cycleLog+="                 ";
	else 
	{
		cycleLog+="CA:"+CalcAddress.toString(16).toUpperCase().padStart(4,"0")+" ";
		cycleLog+="("+(CalcBanked>>16).toString(16).toUpperCase().padStart(2,"0")+":";
		cycleLog+=(CalcBanked&0xFFFF).toString(16).toUpperCase().padStart(4,"0")+")";
	}
	cycleLog+=" "+cycle_count;
	cycleLog+="\n";
	if (op==0) cycleLog+="\n";
}


//**************
//*MESSAGE LOOP*
//**************

function OnMessage(e)
{
	debugflag='';
	//CalcAddress=-1;	//Moved below
	switch (e.data.cmd)
	{
		case 'setup':
			setup(e.data.path,e.data.listing_type,e.data.NMOS_mode);
			break;
		case 'debug':
			if (debugBuffer.length!=0)
			{
				self.postMessage({cmd:"debug",debugBuffer});
				debugBuffer=[];
			}
			break;
		case 'cycles':
			self.postMessage({cmd:"cycles",cycle_count});
			break;
		case 'single':
			//debugflag='<br>Start PC: ' + PC.toString(16).toUpperCase() + '(' + mem[PC].toString(16).toUpperCase() + ')'
			CalcAddress=-1;
			if (cycleLogActivated) recordCycle();
			else opList[mem[bank(PC++)]]();
			//debugflag+='<br>End PC: ' + PC.toString(16).toUpperCase() + '(' + mem[PC].toString(16).toUpperCase() + ')'
			//break;
		case 'update':
			debugflag+='Cycles: ' + cycle_count;
			self.postMessage({cmd:'update',PC,A,X,Y,SP,FlagC,
			FlagZ,FlagI,FlagD,FlagB,FlagV,FlagN,debugflag,
			mem,CalcAddress,RamBank1,RamBank2,RamBank3,RomBank});
			break;
		case 'run':
			if (running==0)
			{
				//self.postMessage({cmd:"msgbox",msg:"begin running"});
				running=1;
				cycleFunc();
			}
			//else self.postMessage({cmd:"msgbox",msg:"did not begin running"});
			break;
		case 'stop':
			if (running==1)
			{
				//self.postMessage({cmd:"msgbox",msg:"begin stopping"});
				running=0;
				self.postMessage({cmd:"stopped"});
			}
			//else self.postMessage({cmd:"msgbox",msg:"did not begin stopping"});
			break;
		case 'reset':
			PC=mem[0xFFFC]+(mem[0xFFFD]<<8);
			FlagD=0;
			//What other flags get set at startup? I? B?
			break;
		case 'keys':
			keyBuffer=keyBuffer.concat(e.data.keys);
			break;
		case 'check screen':
			if (GraphicsDirty)
			{
				self.postMessage({cmd:"screen update",screenMem:mem.slice(GFX_MEM_BEGIN,GFX_MEM_END)});
				GraphicsDirty=false;
			}
			break;
		case 'reset cycles':
			cycle_count=0;
			break;
		case 'memory dump':
			temp_str=""
			for (let i=0;i<BANK_COUNT;i++)
			{
				temp_str+="Bank "+i.toString(16).toUpperCase().padStart(2,"0");
				temp_str+="\n=======\n";
				temp_str+="        x0 x1 x2 x3 x4 x5 x6 x7 x8 x9 xA xB xC xD xE xF | \n";
				temp_str+="        ================================================|=================================\n";
				temp_vals="";
				temp_chars="";
				for (let j=0;j<BANK_SIZE;j++)
				{
					if (j%16==0)
					{
						temp_str+=i.toString(16).toUpperCase().padStart(2,"0")+":";
						temp_str+=j.toString(16).toUpperCase().padStart(4,"0")+" ";
					}
					temp_vals+=mem[i*BANK_SIZE+j].toString(16).toUpperCase().padStart(2,"0")+" ";
					if ((mem[i*BANK_SIZE+j]>=32)&&(mem[i*BANK_SIZE+j]<=126))
					{
						temp_chars+=String.fromCharCode(mem[i*BANK_SIZE+j]);
					}
					else temp_chars+=".";
					
					if (j%16!=15) temp_chars+=".";
					else
					{
						temp_str+=temp_vals+"| "+temp_chars+"\n";
						temp_chars="";
						temp_vals="";
					}
				}
				temp_str+=temp_vals+"| "+temp_chars+"\n";
				temp_chars="";
				temp_vals="";
			}
			self.postMessage({cmd:"memory dump",memDump:temp_str});
			break;
		case 'memory viewer':
			self.postMessage({cmd:'memory viewer',mem});
			break;
		case 'cycle table':
			self.postMessage({cmd:'cycle table',cycleLog});
			break;
		case 'cycle log on':
			cycleLogActivated=true;
			break;
	}
}


//**************
//*DEBUG OUTPUT*
//**************
function debugMsg(msg)
{
	self.postMessage({cmd:"msgbox",msg:msg});
}


//****************
//*SETUP FUNCTION*
//****************

function setup(path,list_style,NMOS)
{
	//Moved above since needed before receive message for setup
	//self.addEventListener('message', OnMessage , false);
	
	//self.postMessage({cmd:"status",msg:"zeroing memory"});
	//for (i=0;i<0x40000;i++) mem[i]=0;
	
	var record_bytes=0;
	var record_address=0;
	var record_hi_address=0;
	var bytes_written=0;
	var listing=[];
	var labellist=[];
	
	GraphicsDirty=false;
	NMOS_mode=NMOS;
	
	//Loading listing and hex files
	self.postMessage({cmd:"status",msg:"loading listing"});
	var myRequest = new Request(path+'listing.lst');
	fetch(myRequest).then(function(response)
	{
		return response.text().then(function(text)
		{
			//self.postMessage({cmd:"status",msg:"raw lst loaded (" + ((text.length)/1024).toFixed(1) + "k)"});
			self.postMessage({cmd:"status",msg:"raw listing loaded"});
			
			//Old version from Kowalski listing
			if (list_style=="Kowalski")
			{	
				var listlines=text.split("\n");
				var error_msg='';
				for (i=0;i<listlines.length;i++)
				{
					var ishex="unknown";
					var islabel="unknown";
					var buff='';
				
					//self.postMessage({cmd:"msgbox",msg:(listing+"\n=====\n"+listlines[i])});
				
					inner_loop:
					for (j=7;j<listlines[i].length;j++)
					{	
						if (j==7)
						{
							if (IsNumChar(listlines[i][7]))
							{
								ishex="yes";
								islabel="no";
							}
							else if (IsHexChar(listlines[i][7]))
							{
								ishex="maybe";
								islabel="maybe";
							}
							else if (IsAlphaChar(listlines[i][7]))
							{
								ishex="no";
								islabel="yes";
							}
							else 
							{
								break inner_loop;
							}
							buff=listlines[i][7];
						}
						else
						{
							if ((islabel=="yes")||(ishex=="maybe"))
							{
								if ((":; "+String.fromCharCode(13)+String.fromCharCode(9)).includes(listlines[i][j]))
								{
									let really_label=true;
									if ((ishex=="yes")||(ishex=="maybe"))
									{
										//C000: is a label
										if (listlines[i][j]==":") really_label=true;
										//C00 is a label (address is always 4 long)
										else if (buff.length!=4) really_label=true;
										//C000 is probably an address not a label
										else really_label=false;
									}
										
									if (really_label)
									{							
										//self.postMessage({cmd:"msgbox",msg:("Label added: "+buff)});
										
										//IGNORES ANY OTHER INFO ON LINE
										//labellist.push(listlines[i].substr(7));
										labellist.push(buff);
										break inner_loop;
									}
								}
							}
							if ((ishex=="yes")||(ishex=="maybe"))
							{
								if (j==11)
								{
									if (listlines[i][11]==' ')
									{
										//self.postMessage({cmd:'msgbox',msg:i+' Hex ' + buff});
										var list_address=HexCharToInt(buff[0])*0x1000;
										list_address+=HexCharToInt(buff[1])*0x100;
										list_address+=HexCharToInt(buff[2])*0x10;
										list_address+=HexCharToInt(buff[3])*0x1;
										
										for (k=0;k<labellist.length;k++)
											listing.push({address:list_address,label:labellist[k],op:''});
										labellist=[];
										if (listlines[i][23]==" ") listing.push({address:list_address,label:'',op:listlines[i].substr(24)});
										//For some reason, .RS is one character closer to the left in listing :/
										else listing.push({address:list_address,label:'',op:listlines[i].substr(23)});
										
										break inner_loop;
									}
									else
									{
										if ((IsAlphaChar(listlines[i][11])==false)&&(IsNumChar(listlines[i][11])==false))
										{
											error_msg="invalid character on line " + i + "\n" + listlines[i];
											break inner_loop;
										}
										else
										{
											ishex="no";
											islabel="true";
										}
									}
								}
								else if (j<11)
								{
									if (IsHexChar(listlines[i][j])==false)
									{	
										if(ishex=="yes")
										{
											error_msg="invalid number format in listing file on line " + i + "\n" + listlines[i];
											break inner_loop;
										}
										else if (ishex=="maybe")
										{
											ishex="no";
											islabel="yes";
											buff+=listlines[i][j];
										}
									}
									else buff+=listlines[i][j];
								}	
							}
							else if (islabel=="yes")
							{
								if ((listlines[i].charCodeAt(j)==13)||(listlines[i].charCodeAt(j)==9))
								{
									//Do nothing. Not invalid but also don't add to name
								}
								else if ((IsAlphaChar(listlines[i][j])==false)&&(IsNumChar(listlines[i][j])==false)&&(listlines[i][j]!="_"))
								{
									error_msg="invalid character ("+listlines[i].charCodeAt(j)+") on line " + i + "\n" + listlines[i];
									break inner_loop;
								}
								else buff+=listlines[i][j];
							}
						}
					}
					if (error_msg!='')
					{
						self.postMessage({cmd:"status",msg:"unable to load listing file!"});
						self.postMessage({cmd:"error",msg:error_msg});
						return;
					}
				}
			}
			else if (list_style=="CA65")
			{
				//New version for CA65
				//Simpler - does not treat labels separately
					//Clickable labels would need to separate them out
				
				let listlines=text.split("\n");
				let error_msg='';
				//Skip first four lines
				for (i=4;i<listlines.length;i++)
				{
					if (listlines[i].substring(6,7)!='r')
					{
						let address=listlines[i].substring(2,6);
						let line=listlines[i].substring(24).trim();
						if ((line!='')&&(line[0]!=';'))
						{
							listing.push({address:parseInt("0x"+address),line:line});
							//self.postMessage({cmd:"msgbox",msg:"$"+address+"$"+line});
						}
					}
					//Had forgotten this then added later. UNTESTED!
					if (error_msg!='')
					{
						self.postMessage({cmd:"status",msg:"unable to load listing file!"});
						self.postMessage({cmd:"error",msg:error_msg});
						return;
					}
				}
			}
			else if (list_style=="AS")
			{
				//Even newer version for Macroassembler AS
				//Like CA65, does not treat labels separately
			
				let listlines=text.split("\n");
				let error_msg='';
				//Skip first 3 rows
				for (i=3;i<listlines.length;i++)
				{
					let addline=false;
					let address=listlines[i].substring(13,17).trim();
					
					//First character of line after main listing is 12 (Form feed control character)
					if (listlines[i].charCodeAt(0)==12)
					{
						break;
					}
					//No address means continued line or output from console, so ignore
					else if (address.length!=0)	
					{
						address=("0000"+address).slice(-4);
						//Valid lines have colon. Check should not be necessary but just in case
						if (listlines[i][18]==":")
						{
							//Check if any bytes were laid down
							if (((listlines[i][20]>="0")&&(listlines[i][20]<="9"))||((listlines[i][20]>="A")&&(listlines[i][20]<="F")))
								if (((listlines[i][21]>="0")&&(listlines[i][21]<="9"))||((listlines[i][21]>="A")&&(listlines[i][21]<="F")))
									if (listlines[i][22]==" ") addline=true;
							//If no bytes laid down, check for label
							//(AS supports label without colon if in first column but assume colon here)
							if (!addline)
							{
								let tempstr=listlines[i].substring(40).trim();
								if (tempstr.indexOf(":")!=-1)
								{
									//Cut off at colon
									tempstr=tempstr.substring(0,tempstr.indexOf(":"));
									//Remove leading period if exists
									if (tempstr[0]==".") tempstr=tempstr.substring(1);
									//Label can't start with a number
									if ((tempstr[0]<"0")||(tempstr[0]>"9"))
									{
										//Must contain only valid characters
										if (tempstr.match(/^[_a-z0-9]+$/i)) addline=true;
									}
								}
							}						
						}
					}
					
					//tempmsg=i + listlines[i];
					//tempmsg+="$"+listlines[i].substring(40);
					//self.postMessage({cmd:"msgbox",msg:tempmsg});
					if (error_msg!='')
					{
						self.postMessage({cmd:"status",msg:"unable to load listing file!"});
						self.postMessage({cmd:"error",msg:error_msg});
						return;
					}
					if (addline)
					{
						let line=listlines[i].substring(40).trim();
						listing.push({address:parseInt("0x"+address),line:line});
						//self.postMessage({cmd:"msgbox",msg:"$"+address+"$"+line});
					}
				}
			}
			else if (list_style=="Generic")
			{				
				let listlines=text.split("\n");
				let error_msg='';
				
				for (i=0;i<listlines.length;i++)
				{
					let address=listlines[i].substring(0,4);
					let line=listlines[i].substring(5).trim();
					listing.push({address:parseInt("0x"+address),line:line});
					//self.postMessage({cmd:"msgbox",msg:"$"+address+"$"+line});			
					
					//Had forgotten this then added later. UNTESTED!
					if (error_msg!='')
					{
						self.postMessage({cmd:"status",msg:"unable to load listing file!"});
						self.postMessage({cmd:"error",msg:error_msg});
						return;
					}
				}
			}
			self.postMessage({cmd:"listing",listing});
			
			self.postMessage({cmd:"status",msg:"loading keys"});
			var myRequest = new Request(path+'keys.txt');
			fetch(myRequest).then(function(response)
			{
				return response.text().then(function(text)
				{
					keyBuffer=keyBuffer.concat(text.split('').map(x => x.charCodeAt(0)));
					
					self.postMessage({cmd:"status",msg:"loading input"});
					var myRequest = new Request(path+'input.txt');
					fetch(myRequest).then(function(response)
					{
						
						return response.text().then(function(text)
						{
							inputBuffer=inputBuffer.concat(text.split('').map(x => x.charCodeAt(0)));
						
							self.postMessage({cmd:"status",msg:"loading hex"});
							var myRequest = new Request(path+'prog.hex');
							fetch(myRequest).then(function(response)
							{
								return response.text().then(function(text)
								{
									//self.postMessage({cmd:"status",msg:"raw hex loaded (" + ((text.length)/1024).toFixed(1) + "k)"});
									self.postMessage({cmd:"status",msg:"raw hex loaded"});
									var lines = text.split("\n");
									for (i=0;i<lines.length;i++)
									{
										if (lines[i].length!=0)
										{
											if (lines[i][0]!=':')
											{
												self.postMessage({cmd:"error",msg:"corrupt hex file!"});
												return;
											}
											
											if ((HexCharToInt(lines[i][7])+HexCharToInt(lines[i][8])*0x10)==0)
											{
												//Line of data
												record_bytes=HexCharToInt(lines[i][1])*16+HexCharToInt(lines[i][2]);
												record_address=HexCharToInt(lines[i][3])*0x1000;
												record_address+=HexCharToInt(lines[i][4])*0x100;
												record_address+=HexCharToInt(lines[i][5])*0x10;
												record_address+=HexCharToInt(lines[i][6])*0x1;
												for (j=0;j<record_bytes;j++)
												{
													mem[record_address+record_hi_address+j]=HexCharToInt(lines[i][9+j*2])*16+
														HexCharToInt(lines[i][10+j*2]);
													bytes_written++;
												}
											}
											else if ((HexCharToInt(lines[i][7])*0x10+HexCharToInt(lines[i][8]))==1)
											{
												//End of file record
												//Nothing should come after this. (Check?)
											}
											else if ((HexCharToInt(lines[i][7])*0x10+HexCharToInt(lines[i][8]))==4)
											{
												//Sets top 16 bits of 32 bit address
												record_hi_address=HexCharToInt(lines[i][9])*0x1000;
												record_hi_address+=HexCharToInt(lines[i][10])*0x100;
												record_hi_address+=HexCharToInt(lines[i][11])*0x10;
												record_hi_address+=HexCharToInt(lines[i][12])*0x1;
												record_hi_address<<=16;
											}
											
											else
											{
												self.postMessage({cmd:"msgbox",msg:"Unknown record type "+HexCharToInt(lines[i][7])+HexCharToInt(lines[i][8])+" in line: "+lines[i]});
											}
										}
									}
									if (bytes_written<1024)
										self.postMessage({cmd:"status",msg:"hex loaded (" + bytes_written + " bytes)"})
									else self.postMessage({cmd:"status",msg:"hex loaded (" + ((bytes_written)/1024).toFixed(1) + "k)"})
									//Set PC to reset vector
									PC=mem[0xFFFC]+(mem[0xFFFD]<<8);
		
									self.postMessage({cmd:"ready"});
								});
							});
						});
					});
				});
			});
		});
	});
}



//*********************************************
//*FUNCTIONS FOR LOADING HEX AND LISTING FILES*
//*********************************************

function HexCharToInt(hexchar)
{
	if ((hexchar.charCodeAt(0)>="0".charCodeAt(0))&&(hexchar.charCodeAt(0)<="9".charCodeAt(0)))
	{
		return hexchar.charCodeAt(0)-"0".charCodeAt(0);
	}
	else return hexchar.charCodeAt(0)-"A".charCodeAt(0)+10;
}
function IsHexChar(hexchar)
{
	if ((hexchar.charCodeAt(0)>="0".charCodeAt(0))&&(hexchar.charCodeAt(0)<="9".charCodeAt(0)))
		return true;
	else if ((hexchar.charCodeAt(0)>="A".charCodeAt(0))&&(hexchar.charCodeAt(0)<="F".charCodeAt(0)))
		return true;
	else return false;
}

function IsNumChar(hexchar)
{
	if ((hexchar.charCodeAt(0)>="0".charCodeAt(0))&&(hexchar.charCodeAt(0)<="9".charCodeAt(0)))
		return true;
	else return false;
}

function IsAlphaChar(hexchar)
{
	if ((hexchar.charCodeAt(0)>="A".charCodeAt(0))&&(hexchar.charCodeAt(0)<="Z".charCodeAt(0)))
		return true;
	else if ((hexchar.charCodeAt(0)>="a".charCodeAt(0))&&(hexchar.charCodeAt(0)<="z".charCodeAt(0)))
		return true;
	else if (hexchar[0]=='_') return true;
	else return false;
}


//***************************************
//*MEMORY BANKING FUNCTIONS FOR EMULATOR*
//***************************************

function bank(address)
{
	//return address;	//for debugging
	tempCalcBanked=0;
	if (address<0x200)
	{
		tempCalcBanked=address;
		return tempCalcBanked;
	}
	else if (address<0x4000) tempCalcBanked=address+RamBank1;			//RAM Bank 0: 0x200- 0x3FFF
	else if (address<0x8000) tempCalcBanked=address+RamBank2-0x4000;	//RAM Bank 1: 0x4000-0x7FFF
	else if (address<0xC000) tempCalcBanked=address+RamBank3-0x8000;	//RAM Bank 2: 0x8000-0xBFFF
	//else return address+RomBank;									//ROM Bank:   0xC000-0xFFFF
	else
	{
		tempCalcBanked=address+RomBank-0xC000;							//ROM Bank:   0xC000-0xFFFF
		return tempCalcBanked;
	}
	//Mark graphics dirty if access to graphics mem between 64k and 92k
	if ((tempCalcBanked>=GFX_MEM_BEGIN)&&(tempCalcBanked<GFX_MEM_END)) GraphicsDirty=true;
	
	return tempCalcBanked;
}


//********************************************
//*PERIPHERAL HANDLING FUNCTIONS FOR EMULATOR*
//********************************************

function peripheral(data)
{
	if ((CalcAddress&0xFFFF)>=PERIPHERALS_BEGIN)
	{
		switch (CalcAddress&0xFFFF)
		{
			case RAM_BANK1:
				RamBank1=BANK_SIZE*data;
				break;
			case RAM_BANK2:
				RamBank2=BANK_SIZE*data;
				break;
			case RAM_BANK3:
				RamBank3=BANK_SIZE*data;
				break;
			case ROM_BANK:
				RomBank=BANK_SIZE*data;
				break;
			case DEBUG:
				debugBuffer.push(data);
				break;
			case DEBUG_HEX:
				let hexout=data.toString(16).toUpperCase();
				if (hexout.length==1)
				{
					debugBuffer.push("0".charCodeAt(0));
					debugBuffer.push(hexout.charCodeAt(0));
				}
				else
				{
					debugBuffer.push(hexout.charCodeAt(0));
					debugBuffer.push(hexout.charCodeAt(1));
				}
				break;
			case DEBUG_DEC:
				let decout=data.toString();
				for (i=0;i<decout.length;i++) debugBuffer.push(decout.charCodeAt(i));
				break;
			case DEBUG_DEC16:
				let decout16=(A+(X<<8)).toLocaleString();
				for (i=0;i<decout16.length;i++) debugBuffer.push(decout16.charCodeAt(i));
				break;
			case DEBUG_TIMING:
				switch (data)
				{
					case TIMING_INSTR_BEGIN:
						timingCycles=cycle_count;
						break;
					case TIMING_INSTR_END:
						let timing_msg=(cycle_count-timingCycles).toLocaleString();
						if (timingEcho)
							for (i=0;i<timing_msg.length;i++)
								debugBuffer.push(timing_msg.charCodeAt(i));
						break;
					case TIMING_INSTR_RESET:
						break;
					case TIMING_TIME_BEGIN:
						break;
					case TIMING_TIME_END:
						break;
					case TIMING_TIME_RESET:
						break;
					case TIMING_ECHO_ON:
						timingEcho=true;
						break;
					case TIMING_ECHO_OFF:
						timingEcho=false;
						break;
				}
				break;
			case LOG_ON:
				cycleLog+="\nLOGGING ON\n";
				cycleLogActivated=true;
				break;
			case LOG_OFF:
				cycleLog+="LOGGING OFF\n\n";
				cycleLogActivated=false;
				break;
			case LOG_SEND:
				self.postMessage({cmd:"cycle log",log:cycleLog});
				break;
			case BELL_SOUND:
				self.postMessage({cmd:"bell"});
				break;
		}
	}
}

function peripheral_read(data)
{
	if ((CalcAddress&0xFFFF)>=PERIPHERALS_BEGIN)
	{
		switch (CalcAddress&0xFFFF)
		{
			case KB_INPUT:
				if (keyBuffer.length==0) return 0;
				else
				{
					//Barry was having trouble with key being undefined
					//console.log("Worker key read: ");
					//console.log("   buffer length: ",keyBuffer.length);
					const key=keyBuffer.shift();
					//console.log("   key: ",key);
					return key;
				}
				break;
			case TIMER_MS4:
				//return parseInt((Date.now()%1000)/4);
				return parseInt((performance.now()%1000)/4);
				break;
			case TIMER_S:
				//return parseInt((Date.now()/1000)%256);
				return parseInt((performance.now()/1000)%256);
				break;
			case FILE_INPUT:
				if (inputBuffer.length==0) return 0;
				else
				{
					const new_byte=inputBuffer.shift();
					return new_byte;
				}
			default:
				return data;
				break;
		}
	}
	else return data;
}


//**************************************
//*MEMORY ACCESS FUNCTIONS FOR EMULATOR*
//**************************************

function memADDRESS()
{
	CalcAddress=mem[bank(PC++)];
	CalcAddress+=(0x100*(mem[bank(PC++)]));
	const temp=bank(CalcAddress);
	CalcBanked=tempCalcBanked;
	return mem[temp];
}
function memADDRESSX()
{
	CalcAddress=mem[bank(PC++)];
	CalcAddress+=(0x100*(mem[bank(PC++)]));
	const high_byte=CalcAddress&0xFF00;
	CalcAddress+=X;
	if (high_byte!=(CalcAddress&0xFF00))
	{
		cycle_count++;
		cycle_penalty=1;
	}
	else cycle_penalty=0;
	CalcAddress&=0xFFFF;
	const temp=bank(CalcAddress);
	CalcBanked=tempCalcBanked;
	return mem[temp];
}
function memADDRESSY()
{
	CalcAddress=mem[bank(PC++)];
	CalcAddress+=(0x100*(mem[bank(PC++)]));
	const high_byte=CalcAddress&0xFF00;
	CalcAddress+=Y;
	if (high_byte!=(CalcAddress&0xFF00))
	{
		cycle_count++;
		cycle_penalty=1;
	}
	else cycle_penalty=0;
	CalcAddress&=0xFFFF;
	const temp=bank(CalcAddress);
	CalcBanked=tempCalcBanked;
	return mem[temp];
}
function memIMMED()
{
	return mem[bank(PC++)];
}
function memIX()
{
	//No banking for pointer since always in ZP
	const t0=(mem[bank(PC++)]+X)&0xFF;
	CalcAddress=(mem[t0]+(mem[t0+1]<<8))&0xFFFF;
	const temp=bank(CalcAddress);
	CalcBanked=tempCalcBanked;
	return mem[temp];
}
function memIY()
{
	//No banking for pointer since always in ZP
	const t0=mem[bank(PC++)];
	CalcAddress=mem[t0]+(mem[(t0+1)&0xFF]<<8);
	const high_byte=CalcAddress&0xFF00;
	CalcAddress+=Y;
	if (high_byte!=(CalcAddress&0xFF00))
	{
		cycle_count++;
		cycle_penalty=1;
	}
	else cycle_penalty=0;
	CalcAddress&=0xFFFF;
	const temp=bank(CalcAddress);
	CalcBanked=tempCalcBanked;
	return mem[temp];
}
function memIZP()
{
	//No banking for pointer since always in ZP
	const t0=mem[bank(PC++)];
	//CalcAddress=mem[t0]+(mem[t0+1]<<8);
	CalcAddress=(mem[t0]+(mem[(t0+1)&0xFF]<<8));
	const temp=bank(CalcAddress);
	CalcBanked=tempCalcBanked;
	return mem[temp];
}
function memZP()
{
	//No banking since always in ZP
	CalcAddress=mem[bank(PC++)];
	CalcBanked=CalcAddress;
	return mem[CalcAddress];
}
function memZPX()
{
	//No banking since always in ZP
	CalcAddress=(mem[bank(PC++)]+X)&0xFF;
	CalcBanked=CalcAddress;
	return mem[CalcAddress];
}
function memZPY()
{
	//No banking since always in ZP
	CalcAddress=(mem[bank(PC++)]+Y)&0xFF;
	CalcBanked=CalcAddress;
	return mem[CalcAddress];
}



//***********************
//*EMULATED INSTRUCTIONS*
//***********************

function subADC(oper)
{
	if (FlagD==1)
	{
		var t1=(A&0xF)+(oper&0xF)+FlagC;
		if (t1>9) t1+=6;
		t1+=(A&0xF0)+(oper&0xF0);
		if (t1>=0xA0) t1+=0x60;
		cycle_count++;
	} 
	else var t1=A+oper+FlagC;
	if (t1>=0x100){t1&=0xFF;FlagC=1;}else FlagC=0;
	if ((A<0x80)&&(oper<0x80)&&(t1>=0x80)) FlagV=1;
	else if ((A>=0x80)&&(oper>=0x80)&&(t1<0x80)) FlagV=1;
	else FlagV=0;
	A=t1;
	if (A==0) FlagZ=1;else FlagZ=0;
	if (A>=0x80) FlagN=1;else FlagN=0;
}
function subAND(oper)
{
	A&=oper;
	if (A==0) FlagZ=1;else FlagZ=0;
	if (A>=0x80) FlagN=1;else FlagN=0;
}
function subASL(oper)
{
	oper<<=1;
	if (oper>=0x100){FlagC=1;oper&=0xFF;}else FlagC=0;
	if (oper==0) FlagZ=1;else FlagZ=0;
	if (oper>=0x80) FlagN=1;else FlagN=0;
	mem[bank(CalcAddress)]=oper;
}
function subBBR(oper)
{
	if ((memZP()&oper)==0)
	{
		var t0=memIMMED();
		if (t0>=0x80) PC-=(0x100-t0);
		else PC+=t0;
	}
	else PC++;
}
function subBBS(oper)
{
	if ((memZP()&oper)!=0)
	{
		var t0=memIMMED();
		if (t0>=0x80) PC-=(0x100-t0);
		else PC+=t0;
	}
	else PC++;
}
function subBIT(oper)
{
	if ((A&oper)==0) FlagZ=1;else FlagZ=0;
	if (oper&0x80) FlagN=1;else FlagN=0;
	if (oper&0x40) FlagV=1;else FlagV=0;
}
function subCMP(oper)
{
	var temp=A-oper;
	if (temp==0) FlagZ=1;else FlagZ=0;
	if (temp>=0) FlagC=1;else FlagC=0;
	if (temp<0) temp+=0x100;
	if (temp>=0x80) FlagN=1;else FlagN=0;
}
function subCPX(oper)
{
	var temp=X-oper;
	if (temp==0) FlagZ=1;else FlagZ=0;
	if (temp>=0) FlagC=1;else FlagC=0;
	if (temp<0) temp+=0x100;
	if (temp>=0x80) FlagN=1;else FlagN=0;
}
function subCPY(oper)
{
	var temp=Y-oper;
	if (temp==0) FlagZ=1;else FlagZ=0;
	if (temp>=0) FlagC=1;else FlagC=0;
	if (temp<0) temp+=0x100;
	if (temp>=0x80) FlagN=1;else FlagN=0;
}
function subDEC(oper)
{
	if (oper==0) oper=0xFF;
	else oper--;
	if (oper==0) FlagZ=1;else FlagZ=0;
	if (oper>=0x80) FlagN=1;else FlagN=0;
	mem[bank(CalcAddress)]=oper;
}
function subEOR(oper)
{
	A^=oper;
	if (A==0) FlagZ=1;else FlagZ=0;
	if (A>=0x80) FlagN=1;else FlagN=0;
}
function subINC(oper)
{
	if (oper==0xFF){oper=0;FlagZ=1;} else{oper++;FlagZ=0;}
	if (oper>=0x80) FlagN=1;else FlagN=0;
	mem[bank(CalcAddress)]=oper;
}
function subLDA(oper)
{
	A=peripheral_read(oper);
	if (A==0) FlagZ=1;else FlagZ=0;
	if (A>=0x80) FlagN=1;else FlagN=0;
}
function subLDX(oper)
{
	X=peripheral_read(oper);
	if (X==0) FlagZ=1;else FlagZ=0;
	if (X>=0x80) FlagN=1;else FlagN=0;
}
function subLDY(oper)
{
	Y=peripheral_read(oper);
	if (Y==0) FlagZ=1;else FlagZ=0;
	if (Y>=0x80) FlagN=1;else FlagN=0;
}
function subLSR(oper)
{
	if (oper&1) {FlagC=1;}else FlagC=0;
	oper>>=1;
	if (oper==0) FlagZ=1;else FlagZ=0;
	//if (oper>=0x80) FlagN=1;else FlagN=0;
	FlagN=0;
	mem[bank(CalcAddress)]=oper;
}
function subORA(oper)
{
	A|=oper;
	if (A==0) FlagZ=1;else FlagZ=0;
	if (A>=0x80) FlagN=1;else FlagN=0;
	//debugflag+="\nFlagN: "+FlagN;
}
function subRMB(oper)
{
	//No banking since zero page
	CalcAddress=mem[bank(PC++)];
	mem[CalcAddress]=mem[CalcAddress]&oper;
}
function subROL(oper)
{
	oper=(oper<<1)+FlagC;
	if (oper>=0x100){FlagC=1;oper&=0xFF;}else FlagC=0;
	if (oper==0) FlagZ=1;else FlagZ=0;
	if (oper>=0x80) FlagN=1;else FlagN=0;
	mem[bank(CalcAddress)]=oper;
}
function subROR(oper)
{
	var t0;
	if (oper&1) t0=1;else t0=0;
	oper>>=1;
	if (FlagC) oper|=0x80;
	FlagC=t0;
	if (oper==0) FlagZ=1;else FlagZ=0;
	if (oper>=0x80) FlagN=1;else FlagN=0;
	mem[bank(CalcAddress)]=oper;
}
function subSBC(oper)
{
	if (FlagD==1) 
	{
		if ((oper==0)&&(FlagC==0))
		{
			oper=1;
			FlagC=1;
		}
		var t1=(A&0xF)+(9-(oper&0xF)+FlagC);
		if (t1>9) t1+=6;
		t1+=(A&0xF0)+(0x90-(oper&0xF0));
		if (t1>0x99) t1+=0x60;
		if (t1>=0x100) 
		{
			t1-=0x100;
			FlagC=1;
		}
		else FlagC=0;
		//May happen if oper is not valid BCD
		if (t1<0) t1=0;
		cycle_count++;
	}
	else
	{
		var t1=A-oper-1+FlagC;
		if (t1<0){t1+=0x100;FlagC=0;}else FlagC=1;
	}
	if ((A<0x80)&&(oper>=0x80)&&(t1>=0x80)) FlagV=1;
	else if ((A>=0x80)&&(oper<0x80)&&(t1<0x80)) FlagV=1;
	else FlagV=0;
	A=t1;
	if (A==0) FlagZ=1;else FlagZ=0;
	if (A>=0x80) FlagN=1;else FlagN=0;
}
function subSMB(oper)
{
	//No banking since zero page
	CalcAddress=mem[bank(PC++)];
	mem[bank(CalcAddress)]=mem[bank(CalcAddress)]|oper;
}
function subSTA()
	{peripheral(A);mem[bank(CalcAddress)]=A;}
function subSTX()
	{peripheral(X);mem[bank(CalcAddress)]=X;}
function subSTY()
	{peripheral(Y);mem[bank(CalcAddress)]=Y;}
function subSTZ()
	{peripheral(0);mem[bank(CalcAddress)]=0;}
function subTRB(oper)
{
	if ((A&oper)==0) FlagZ=1;else FlagZ=0;
	mem[bank(CalcAddress)]=(A^0xFF)&oper;
}
function subTSB(oper)
{
	if ((A&oper)==0) FlagZ=1;else FlagZ=0;
	mem[bank(CalcAddress)]=A|oper;
}

function opBRK()													//0x00
{	
	//FlagB=0;
	//PC--;
	PC++;
	if (running==1)
	{
		running=0;
		self.postMessage({cmd:"stopped"});
	}
	cycle_count+=7;
}
function opORA_IX(){subORA(memIX());cycle_count+=6;}				//0x01
function opNOP_IMMED(){PC++;cycle_count+=2;}						//0x02
function opNOP(){cycle_count+=2;}									//0x03
function opTSB_ZP(){subTSB(memZP());cycle_count+=5;}				//0x04
function opORA_ZP(){subORA(memZP());cycle_count+=3;}				//0x05
function opASL_ZP(){subASL(memZP());cycle_count+=5;}				//0x06
function opRMB0(){subRMB(0xFE);cycle_count+=5;}						//0x07
function opPHP()													//0x08
{
	mem[0x100+SP]=FlagC+FlagZ*2+FlagI*4+FlagD*8+
		FlagB*16+32+FlagV*64+FlagN*128;
	if (SP==0) SP=0xFF;
	else SP--;
	cycle_count+=3;
}
function opORA_IMMED(){subORA(memIMMED());cycle_count+=2;}			//0x09
function opASL()													//0x0A
{
	A<<=1;
	if (A>=0x100){FlagC=1;A&=0xFF}else FlagC=0;
	if (A==0) FlagZ=1;else FlagZ=0;
	if (A>=0x80) FlagN=1;else FlagN=0;
	cycle_count+=2;
}
//function opNOP()													//0x0B
function opTSB_ADDRESS(){subTSB(memADDRESS());cycle_count+=6;}		//0x0C
function opORA_ADDRESS(){subORA(memADDRESS());cycle_count+=4;}		//0x0D
function opASL_ADDRESS(){subASL(memADDRESS());cycle_count+=6;}		//0x0E
function opBBR0(){subBBR(0x01);cycle_count+=5;}						//0x0F
function opBPL()													//0x10
{
	if (FlagN==0)
	{
		//const high_byte=PC&0xFF00;
		const t0=memIMMED();
		const high_byte=PC&0xFF00;
		if (t0>=0x80) PC-=(0x100-t0);
		else PC+=t0;
		if (high_byte!=(PC&0xFF00)) cycle_count++;
		cycle_count++;
	}
	else PC++;
	cycle_count+=2;
}
function opORA_IY(){subORA(memIY());cycle_count+=5;}				//0x11
function opORA_IZP(){subORA(memIZP());cycle_count+=5;}				//0x12
//function opNOP()													//0x13
function opTRB_ZP(){subTRB(memZP());cycle_count+=5;}				//0x14
function opORA_ZPX(){subORA(memZPX());cycle_count+=4;}				//0x15
function opASL_ZPX(){subASL(memZPX());cycle_count+=6;}				//0x16
function opRMB1(){subRMB(0xFD);cycle_count+=5;}						//0x17
function opCLC(){FlagC=0;cycle_count+=2;}							//0x18
function opORA_ADDRESSY(){subORA(memADDRESSY());cycle_count+=4;}	//0x19
function opINC()													//0x1A
{
	if (A==0xFF){A=0;FlagZ=1;} else{A++;FlagZ=0;}
	if (A>=0x80) FlagN=1;else FlagN=0;
	cycle_count+=2;
}
//function opNOP()													//0x1B
function opTRB_ADDRESS(){subTRB(memADDRESS());cycle_count+=6;}		//0x1C
function opORA_ADDRESSX(){subORA(memADDRESSX());cycle_count+=4;}	//0x1D
function opASL_ADDRESSX(){subASL(memADDRESSX());cycle_count+=6;}	//0x1E
function opBBR1(){subBBR(0x02);cycle_count+=5;}						//0x1F
function opJSR()													//0x20
{
	mem[0x100+SP]=(PC+1)>>8;
	if (SP==0) SP=0xFF;else SP--;
	mem[0x100+SP]=(PC+1)&0xFF;
	if (SP==0) SP=0xFF;else SP--;
	PC=mem[bank(PC)]+0x100*mem[bank(PC+1)];
	cycle_count+=6;
}
function opAND_IX(){subAND(memIX());cycle_count+=6;}				//0x21
//function opNOP_IMMED()											//0x22
//function opNOP()													//0x23
function opBIT_ZP(){subBIT(memZP());cycle_count+=3;}				//0x24
function opAND_ZP(){subAND(memZP());cycle_count+=3;}				//0x25
function opROL_ZP(){subROL(memZP());cycle_count+=5;}				//0x26
function opRMB2(){subRMB(0xFB);cycle_count+=5;}						//0x27
function opPLP()													//0x28
{
	if (SP==0xFF) SP=0;
	else SP++;
	t0=mem[0x100+SP];
	if (t0&1) FlagC=1;else FlagC=0;
	if (t0&2) FlagZ=1;else FlagZ=0;
	if (t0&4) FlagI=1;else FlagI=0;
	if (t0&8) FlagD=1;else FlagD=0;
	//if (t0&16) FlagB=1;else FlagB=0;
	FlagB=1;
	if (t0&64) FlagV=1;else FlagV=0;
	if (t0&128) FlagN=1;else FlagN=0;
	cycle_count+=4;
}
function opAND_IMMED(){subAND(memIMMED());cycle_count+=2;}			//0x29
function opROL()													//0x2A
{
	A=(A<<1)+FlagC;
	if (A>=0x100){FlagC=1;A&=0xFF;}else FlagC=0;
	if (A==0) FlagZ=1;else FlagZ=0;
	if (A>=0x80) FlagN=1;else FlagN=0;
	cycle_count+=2;
}
//function opNOP()													//0x2B
function opBIT_ADDRESS(){subBIT(memADDRESS());cycle_count+=4;}		//0x2C
function opAND_ADDRESS(){subAND(memADDRESS());cycle_count+=4;}		//0x2D
function opROL_ADDRESS(){subROL(memADDRESS());cycle_count+=6;}		//0x2E
function opBBR2(){subBBR(0x04);cycle_count+=5;}						//0x2F
function opBMI()													//0x30
{
	if (FlagN==1)
	{
		//const high_byte=PC&0xFF00;
		const t0=memIMMED();
		const high_byte=PC&0xFF00;
		if (t0>=0x80) PC-=(0x100-t0);
		else PC+=t0;
		if (high_byte!=(PC&0xFF00)) cycle_count++;
		cycle_count++;
	}
	else PC++;
	cycle_count+=2;
}
function opAND_IY(){subAND(memIY());cycle_count+=5;}				//0x31
function opAND_IZP(){subAND(memIZP());cycle_count+=5;}				//0x32
//function opNOP()													//0x33
function opBIT_ZPX(){subBIT(memZPX());cycle_count+=4;}				//0x34
function opAND_ZPX(){subAND(memZPX());cycle_count+=4;}				//0x35
function opROL_ZPX(){subROL(memZPX());cycle_count+=6;}				//0x36
function opRMB3(){subRMB(0xF7);cycle_count+=5;}						//0x37
function opSEC(){FlagC=1;cycle_count+=2;}							//0x38
function opAND_ADDRESSY(){subAND(memADDRESSY());cycle_count+=4;}	//0x39
function opDEC()													//0x3A
{	
	if (A==0) A=0xFF;
	else A--;
	if (A==0) FlagZ=1;else FlagZ=0;
	if (A>=0x80) FlagN=1;else FlagN=0;
	cycle_count+=2;
}
//function opNOP()													//0x3B
function opBIT_ADDRESSX(){subBIT(memADDRESSX());cycle_count+=4;}	//0x3C
function opAND_ADDRESSX(){subAND(memADDRESSX());cycle_count+=4;}	//0x3D
function opROL_ADDRESSX(){subROL(memADDRESSX());cycle_count+=6;}	//0x3E
function opBBR3(){subBBR(0x08);cycle_count+=5;}						//0x3F
function opRTI()													//0x40
{
	opPLP();//4 cycles
	opRTS();//6 cycles
	PC--;//interrupt pushes PC, not PC-1
	cycle_count-=5;//should be +5 overall
}
function opEOR_IX(){subEOR(memIX());cycle_count+=6;}				//0x41
//function opNOP_IMMED()											//0x42
//function opNOP()													//0x43
function opNOP_ZP(){PC++;cycle_count+=3;}							//0x44
function opEOR_ZP(){subEOR(memZP());cycle_count+=3;}				//0x45
function opLSR_ZP(){subLSR(memZP());cycle_count+=5;}				//0x46
function opRMB4(){subRMB(0xEF);cycle_count+=5;}						//0x47
function opPHA()													//0x48
{	
	mem[0x100+SP]=A;
	if (SP==0) SP=0xFF;
	else SP--;
	cycle_count+=3;
}
function opEOR_IMMED(){subEOR(memIMMED());cycle_count+=2;}			//0x49
function opLSR()													//0x4A
{
	if (A&1)FlagC=1;else FlagC=0;
	A>>=1;
	if (A==0) FlagZ=1;else FlagZ=0;
	//if (A>=0x80) FlagN=1;else FlagN=0;
	FlagN=0;
	cycle_count+=2;
}
//function opNOP()													//0x4B
function opJMP_ADDRESS()											//0x4C
{
	PC=mem[bank(PC)]+0x100*mem[bank(PC+1)];
	cycle_count+=3;
}
function opEOR_ADDRESS(){subEOR(memADDRESS());cycle_count+=4;}		//0x4D
function opLSR_ADDRESS(){subLSR(memADDRESS());cycle_count+=6;}		//0x4E
	
function opBBR4(){subBBR(0x10);cycle_count+=5;}						//0x4F
function opBVC()													//0x50
{
	if (FlagV==0)
	{
		//const high_byte=PC&0xFF00;
		const t0=memIMMED();
		const high_byte=PC&0xFF00;
		if (t0>=0x80) PC-=(0x100-t0);
		else PC+=t0;
		if (high_byte!=(PC&0xFF00)) cycle_count++;
		cycle_count++;
	}
	else PC++;
	cycle_count+=2;
}
function opEOR_IY(){subEOR(memIY());cycle_count+=5;}				//0x51
function opEOR_IZP(){subEOR(memIZP());cycle_count+=5;}				//0x52
//function opNOP()													//0x53
function opNOP_ZPX(){PC++;cycle_count+=4;}							//0x54
function opEOR_ZPX(){subEOR(memZPX());cycle_count+=4;}				//0x55
function opLSR_ZPX(){subLSR(memZPX());cycle_count+=6;}				//0x56
function opRMB5(){subRMB(0xDF);cycle_count+=5;}						//0x57
function opCLI(){FlagI=0;cycle_count+=2;}							//0x58
function opEOR_ADDRESSY(){subEOR(memADDRESSY());cycle_count+=4;}	//0x59
function opPHY()													//0x5A
{	
	mem[0x100+SP]=Y;
	if (SP==0) SP=0xFF;
	else SP--;
	cycle_count+=3;
}
//function opNOP()													//0x5B
function opNOP_ADDRESS(){PC+=2;cycle_count+=8;}						//0x5C
function opEOR_ADDRESSX(){subEOR(memADDRESSX());cycle_count+=4;}	//0x5D
function opLSR_ADDRESSX(){subLSR(memADDRESSX());cycle_count+=6;}	//0x5E
function opBBR5(){subBBR(0x20);cycle_count+=5;}						//0x5F
function opRTS()													//0x60
{
	if (SP==0xFF) SP=0;
	else SP++;
	PC=mem[0x100+SP];
	if (SP==0xFF) SP=0;
	else SP++;
	PC+=mem[0x100+SP]*0x100+1;
	cycle_count+=6;
}
function opADC_IX(){subADC(memIX());cycle_count+=6;}				//0x61
//function opNOP_IMMED()											//0x62
//function opNOP()													//0x63
function opSTZ_ZP(){memZP();subSTZ();cycle_count+=3;}				//0x64
function opADC_ZP(){subADC(memZP());cycle_count+=3;}				//0x65
function opROR_ZP(){subROR(memZP());cycle_count+=5;}				//0x66
function opRMB6(){subRMB(0xBF);cycle_count+=5;}						//0x67
function opPLA()													//0x68
{
	if (SP==0xFF) SP=0;
	else SP++;
	A=mem[0x100+SP];
	if (A==0) FlagZ=1;else FlagZ=0;
	if (A>=0x80) FlagN=1;else FlagN=0;
	cycle_count+=4;
}
function opADC_IMMED(){subADC(memIMMED());cycle_count+=2;}			//0x69
function opROR()													//0x6A
{
	var t0;
	if (A&1) t0=1;else t0=0;
	A>>=1;
	if (FlagC) A|=0x80;
	FlagC=t0;
	if (A==0) FlagZ=1;else FlagZ=0;
	if (A>=0x80) FlagN=1;else FlagN=0;
	cycle_count+=2;
}
//function opNOP()													//0x6B
function opJMP_I()													//0x6C
{
	if ((NMOS_mode)&&(mem[bank(PC)]==0xFF))
	{
		//Keep PC on this instruction for debugging
		PC--;
		
		if (running==1)
		{
			running=0;
			self.postMessage({cmd:"stopped"});
		}
		
		self.postMessage({cmd:"msgbox",msg:"Trapped: JMP (xxFF) in NMOS mode!"});
	}
	else
	{
		var t0=mem[bank(PC)]+0x100*mem[bank(PC+1)];
		PC=mem[bank(t0)]+0x100*mem[bank(t0+1)];
	}
	cycle_count+=6;
}	
function opADC_ADDRESS(){subADC(memADDRESS());cycle_count+=4;}		//0x6D
function opROR_ADDRESS(){subROR(memADDRESS());cycle_count+=6;}		//0x6E
function opBBR6(){subBBR(0x40);cycle_count+=5;}						//0x6F
function opBVS()													//0x70
{
	if (FlagV==1)
	{
		//const high_byte=PC&0xFF00;
		const t0=memIMMED();
		const high_byte=PC&0xFF00;
		if (t0>=0x80) PC-=(0x100-t0);
		else PC+=t0;
		if (high_byte!=(PC&0xFF00)) cycle_count++;
		cycle_count++;
	}
	else PC++;
	cycle_count+=2;
}
function opADC_IY(){subADC(memIY());cycle_count+=5;}				//0x71
function opADC_IZP(){subADC(memIZP());cycle_count+=5}				//0x72
//function opNOP()													//0x73
function opSTZ_ZPX(){memZPX();subSTZ();cycle_count+=4;}				//0x74
function opADC_ZPX(){subADC(memZPX());cycle_count+=4;}				//0x75
function opROR_ZPX(){subROR(memZPX());cycle_count+=6;}				//0x76
function opRMB7(){subRMB(0x7F);cycle_count+=5;}						//0x77
function opSEI(){FlagI=1;cycle_count+=2;}							//0x78
function opADC_ADDRESSY(){subADC(memADDRESSY());cycle_count+=4;}	//0x79
function opPLY()													//0x7A
{
	if (SP==0xFF) SP=0;
	else SP++;
	Y=mem[0x100+SP];
	if (Y==0) FlagZ=1;else FlagZ=0;
	if (Y>=0x80) FlagN=1;else FlagN=0;
	cycle_count+=4;
}
//function opNOP()													//0x7B
function opJMP_IADDRESSX()											//0x7C
{
	var t0=mem[bank(PC)]+0x100*mem[bank(PC+1)]+X;
	PC=mem[bank(t0)]+0x100*mem[bank(t0+1)];
	cycle_count+=6;
}
function opADC_ADDRESSX(){subADC(memADDRESSX());cycle_count+=4;}	//0x7D
function opROR_ADDRESSX(){subROR(memADDRESSX());cycle_count+=6;}	//0x7E
function opBBR7(){subBBR(0x80);cycle_count+=5;}						//0x7F
function opBRA()													//0x80
{
	const t0=memIMMED();
	const high_byte=PC&0xFF00;
	if (t0>=0x80) PC-=(0x100-t0);
	else PC+=t0;
	if (high_byte!=(PC&0xFF00)) cycle_count++;
	cycle_count+=3;
}
function opSTA_IX(){memIX();subSTA();cycle_count+=6;}				//0x81
//function opNOP_IMMED()											//0x82
//function opNOP()													//0x83
function opSTY_ZP(){memZP();subSTY();cycle_count+=3;}				//0x84
function opSTA_ZP(){memZP();subSTA();cycle_count+=3;}				//0x85
function opSTX_ZP(){memZP();subSTX();cycle_count+=3;}				//0x86
function opSMB0(){subSMB(0x01);cycle_count+=5;}						//0x87
function opDEY()													//0x88
{	
	if (Y==0) Y=0xFF;
	else Y--;
	if (Y==0) FlagZ=1;else FlagZ=0;
	if (Y>=0x80) FlagN=1;else FlagN=0;
	cycle_count+=2;
}
function opBIT_IMMED()												//0x89
{
	if ((A&memIMMED())==0) FlagZ=1;else FlagZ=0;
	cycle_count+=2;
}
function opTXA()													//0x8A
{
	A=X;
	if (A==0) FlagZ=1;else FlagZ=0;
	if (A>=0x80) FlagN=1;else FlagN=0;
	cycle_count+=2;
}
//function opNOP()													//0x8B
function opSTY_ADDRESS(){memADDRESS();subSTY();cycle_count+=4;}		//0x8C
function opSTA_ADDRESS(){memADDRESS();subSTA();cycle_count+=4;}		//0x8D
function opSTX_ADDRESS(){memADDRESS();subSTX();cycle_count+=4;}		//0x8E
function opBBS0(){subBBS(0x01);cycle_count+=5;}						//0x8F
function opBCC()													//0x90
{
	if (FlagC==0)
	{
		//const high_byte=PC&0xFF00;
		const t0=memIMMED();
		const high_byte=PC&0xFF00;
		if (t0>=0x80) PC-=(0x100-t0);
		else PC+=t0;
		if (high_byte!=(PC&0xFF00)) cycle_count++;
		cycle_count++;
	}
	else PC++;
	cycle_count+=2;
}
function opSTA_IY()													//0x91
{	
	memIY();
	subSTA();
	cycle_count+=6-cycle_penalty;	//no cycle penalty
}
function opSTA_IZP(){memIZP();subSTA();cycle_count+=5;}				//0x92
//function opNOP()													//0x93
function opSTY_ZPX(){memZPX();subSTY();cycle_count+=4;}				//0x94
function opSTA_ZPX(){memZPX();subSTA();cycle_count+=4;}				//0x95
function opSTX_ZPY(){memZPY();subSTX();cycle_count+=4;}				//0x96
function opSMB1(){subSMB(0x02);cycle_count+=5;}						//0x97
function opTYA()													//0x98
{
	A=Y;
	if (A==0) FlagZ=1;else FlagZ=0;
	if (A>=0x80) FlagN=1;else FlagN=0;
	cycle_count+=2;
}
function opSTA_ADDRESSY()											//0x99
{
	memADDRESSY();
	subSTA();
	//debugMsg("STA_ADDRESSY: " + bank(CalcAddress));
	cycle_count+=5-cycle_penalty; //no cycle penalty
	
}
function opTXS()													//0x9A
{
	SP=X;
	//Don't set flags!
	//if (SP==0) FlagZ=1;else FlagZ=0;
	//if (SP>=0x80) FlagN=1;else FlagN=0;
	cycle_count+=2;
}
//function opNOP()													//0x9B
function opSTZ_ADDRESS(){memADDRESS();subSTZ();cycle_count+=4;}		//0x9C
function opSTA_ADDRESSX()											//0x9D
{
	memADDRESSX();
	subSTA();
	cycle_count+=5-cycle_penalty;} //no cycle penalty	
function opSTZ_ADDRESSX(){memADDRESSX();subSTZ();cycle_count+=5;}	//0x9E
function opBBS1(){subBBS(0x02);cycle_count+=5;}						//0x9F
function opLDY_IMMED(){subLDY(memIMMED());cycle_count+=2;}			//0xA0
function opLDA_IX(){subLDA(memIX());cycle_count+=6;}				//0xA1
function opLDX_IMMED(){subLDX(memIMMED());cycle_count+=2;}			//0xA2
//function opNOP()													//0xA3
function opLDY_ZP(){subLDY(memZP());cycle_count+=3;}				//0xA4
function opLDA_ZP(){subLDA(memZP());cycle_count+=3;}				//0xA5
function opLDX_ZP(){subLDX(memZP());cycle_count+=3;}				//0xA6
function opSMB2_ZP(){subSMB(0x04);cycle_count+=5;}					//0xA7
function opTAY()													//0xA8
{
	Y=A;
	if (Y==0) FlagZ=1;else FlagZ=0;
	if (Y>=0x80) FlagN=1;else FlagN=0;
	cycle_count+=2;
}
function opLDA_IMMED(){subLDA(memIMMED());cycle_count+=2;}			//0xA9
function opTAX()													//0xAA
{
	X=A;
	if (X==0) FlagZ=1;else FlagZ=0;
	if (X>=0x80) FlagN=1;else FlagN=0;
	cycle_count+=2;
}
//function opNOP()													//0xAB
function opLDY_ADDRESS(){subLDY(memADDRESS());cycle_count+=4;}		//0xAC
function opLDA_ADDRESS(){subLDA(memADDRESS());cycle_count+=4;}		//0xAD
function opLDX_ADDRESS(){subLDX(memADDRESS());cycle_count+=4;}		//0xAE
function opBBS2(){subBBS(0x04);cycle_count+=5;}						//0xAF
function opBCS()													//0xB0
{
	if (FlagC==1)
	{
		//const high_byte=PC&0xFF00;
		const t0=memIMMED();
		const high_byte=PC&0xFF00;
		if (t0>=0x80) PC-=(0x100-t0);
		else PC+=t0;
		if (high_byte!=(PC&0xFF00)) cycle_count++;
		cycle_count++;
	}
	else PC++;
	cycle_count+=2;
}
function opLDA_IY(){subLDA(memIY());cycle_count+=5;}				//0xB1
function opLDA_IZP(){subLDA(memIZP());cycle_count+=5;}				//0xB2
//function opNOP()													//0xB3
function opLDY_ZPX(){subLDY(memZPX());cycle_count+=4;}				//0xB4
function opLDA_ZPX(){subLDA(memZPX());cycle_count+=4;}				//0xB5
function opLDX_ZPY(){subLDX(memZPY());cycle_count+=4;}				//0xB6
function opSMB3(){subSMB(0x08);cycle_count+=5;}						//0xB7
function opCLV(){FlagV=0;cycle_count+=2;}							//0xB8
function opLDA_ADDRESSY(){subLDA(memADDRESSY());cycle_count+=4;}	//0xB9
function opTSX()													//0xBA
{
	X=SP;
	if (X==0) FlagZ=1;else FlagZ=0;
	if (X>=0x80) FlagN=1;else FlagN=0;
	cycle_count+=2;
}
//function opNOP()													//0xBB
function opLDY_ADDRESSX(){subLDY(memADDRESSX());cycle_count+=4;}	//0xBC
function opLDA_ADDRESSX(){subLDA(memADDRESSX());cycle_count+=4;}	//0xBD
function opLDX_ADDRESSY(){subLDX(memADDRESSY());cycle_count+=4;}	//0xBE
function opBBS3(){subBBS(0x08);cycle_count+=5;}						//0xBF
function opCPY_IMMED(){subCPY(memIMMED());cycle_count+=2;}			//0xC0
function opCMP_IX(){subCMP(memIX());cycle_count+=6;}				//0xC1
//function opNOP_IMMED()											//0xC2
//function opNOP()													//0xC3
function opCPY_ZP(){subCPY(memZP());cycle_count+=3;}				//0xC4
function opCMP_ZP(){subCMP(memZP());cycle_count+=3;}				//0xC5
function opDEC_ZP(){subDEC(memZP());cycle_count+=5;}				//0xC6
function opSMB4(){subSMB(0x10);cycle_count+=5;}						//0xC7
function opINY()													//0xC8
{
	if (Y==0xFF){Y=0;FlagZ=1;} else{Y++;FlagZ=0;}
	if (Y>=0x80) FlagN=1;else FlagN=0;
	cycle_count+=2;	
}
function opCMP_IMMED(){subCMP(memIMMED());cycle_count+=2;}			//0xC9
function opDEX()													//0xCA
{
	if (X==0) X=0xFF;
	else X--;
	if (X==0) FlagZ=1;else FlagZ=0;
	if (X>=0x80) FlagN=1;else FlagN=0;
	cycle_count+=2;
}	
function opWAI(){running=0;cycle_count+=3;}							//0xCB
function opCPY_ADDRESS(){subCPY(memADDRESS());cycle_count+=4;}		//0xCC
function opCMP_ADDRESS(){subCMP(memADDRESS());cycle_count+=4;}		//0xCD
function opDEC_ADDRESS(){subDEC(memADDRESS());cycle_count+=6;}		//0xCE
function opBBS4(){subBBS(0x10);cycle_count+=5;}						//0xCF
function opBNE()													//0xD0
{
	if (FlagZ==0)
	{
		//const high_byte=PC&0xFF00;
		const t0=memIMMED();
		const high_byte=PC&0xFF00;
		if (t0>=0x80) PC-=(0x100-t0);
		else PC+=t0;
		if (high_byte!=(PC&0xFF00)) cycle_count++;
		cycle_count++;
	}
	else PC++;
	cycle_count+=2;
}
function opCMP_IY(){subCMP(memIY());cycle_count+=5;}				//0xD1
function opCMP_IZP(){subCMP(memIZP());cycle_count+=5;}				//0xD2
//function opNOP()													//0xD3
//function opNOP_ZPX()												//0xD4
function opCMP_ZPX(){subCMP(memZPX());cycle_count+=4;}				//0xD5
function opDEC_ZPX(){subDEC(memZPX());cycle_count+=6;}				//0xD6
function opSMB5(){subSMB(0x20);cycle_count+=5;}						//0xD7													//0xD7
function opCLD(){FlagD=0;cycle_count+=2;}							//0xD8
function opCMP_ADDRESSY(){subCMP(memADDRESSY());cycle_count+=4;}	//0xD9
function opPHX()													//0xDA
{	
	mem[0x100+SP]=X;
	if (SP==0) SP=0xFF;
	else SP--;
	cycle_count+=3;
}
function opSTP(){running=0;cycle_count+=3;}							//0xDB
//function opNOP_ADDRESS()											//0xDC
function opCMP_ADDRESSX(){subCMP(memADDRESSX());cycle_count+=4;}	//0xDD
function opDEC_ADDRESSX()											//0xDE
{
	subDEC(memADDRESSX());
	cycle_count+=7-cycle_penalty;	//no cycle penalty
}
function opBBS5(){subBBS(0x20);cycle_count+=5;}						//0xDF
function opCPX_IMMED(){subCPX(memIMMED());cycle_count+=2;}			//0xE0
function opSBC_IX(){subSBC(memIX());cycle_count+=6;}				//0xE1
//function opNOP_IMMED()											//0xE2
//function opNOP()													//0xE3
function opCPX_ZP(){subCPX(memZP());cycle_count+=3;}				//0xE4
function opSBC_ZP(){subSBC(memZP());cycle_count+=3;}				//0xE5
function opINC_ZP(){subINC(memZP());cycle_count+=5;}				//0xE6
function opSMB6(){subSMB(0x40);cycle_count+=5;}						//0xE7
function opINX()													//0xE8
{
	if (X==0xFF){X=0;FlagZ=1;} else{X++;FlagZ=0;}
	if (X>=0x80) FlagN=1;else FlagN=0;
	cycle_count+=2;
}
function opSBC_IMMED(){subSBC(memIMMED());cycle_count+=2;}			//0xE9
//function opNOP()													//0xEA
//function opNOP()													//0xEB
function opCPX_ADDRESS(){subCPX(memADDRESS());cycle_count+=4;}		//0xEC
function opSBC_ADDRESS(){subSBC(memADDRESS());cycle_count+=4;}		//0xED
function opINC_ADDRESS(){subINC(memADDRESS());cycle_count+=5;}		//0xEE
function opBBS6(){subBBS(0x40);cycle_count+=5;}						//0xEF
function opBEQ()													//0xF0
{
	if (FlagZ==1)
	{
		//const high_byte=PC&0xFF00;
		const t0=memIMMED();
		const high_byte=PC&0xFF00;
		if (t0>=0x80) PC-=(0x100-t0);
		else PC+=t0;
		if (high_byte!=(PC&0xFF00)) cycle_count++;
		cycle_count++;
	}
	else PC++;
	cycle_count+=2;
}
function opSBC_IY(){subSBC(memIY());cycle_count+=5;}				//0xF1
function opSBC_IZP(){subSBC(memIZP());cycle_count+=5;}				//0xF2
//function opNOP()													//0xF3
//function opNOP_ZPX()												//0xF4
function opSBC_ZPX(){subSBC(memZPX());cycle_count+=4;}				//0xF5
function opINC_ZPX(){subINC(memZPX());cycle_count+=6;}				//0xF6
function opSMB7(){subSMB(0x80);cycle_count+=5;}						//0xF7
function opSED(){FlagD=1;cycle_count+=2;}							//0xF8
function opSBC_ADDRESSY(){subSBC(memADDRESSY());cycle_count+=4;}	//0xF9
function opPLX()													//0xFA
{
	if (SP==0xFF) SP=0;
	else SP++;
	X=mem[0x100+SP];
	if (X==0) FlagZ=1;else FlagZ=0;
	if (X>=0x80) FlagN=1;else FlagN=0;
	cycle_count+=4;
}
//function opNOP()													//0xFB
//function opNOP_ADDRESS()											//0xFC
function opSBC_ADDRESSX(){subSBC(memADDRESSX());cycle_count+=4;}	//0xFD
function opINC_ADDRESSX()											//0xFE
{	
	subINC(memADDRESSX());
	cycle_count+=7-cycle_penalty;	//no cycle penalty
}
function opBBS7(){subBBS(0x80);cycle_count+=5;}						//0xFF

var opLens=[2,2,2,1,2,2,2,2,1,2,1,1,3,3,3,3,2,2,2,1,2,2,2,2,1,3,1,1,3,3,3,3,
			3,2,2,1,2,2,2,2,1,2,1,1,3,3,3,3,2,2,2,1,2,2,2,2,1,3,1,1,3,3,3,3,
			1,2,2,1,2,2,2,2,1,2,1,1,3,3,3,3,2,2,2,1,2,2,2,2,1,3,1,1,3,3,3,3,
			1,2,2,1,2,2,2,2,1,2,1,1,3,3,3,3,2,2,2,1,2,2,2,2,1,3,1,1,3,3,3,3,
			2,2,2,1,2,2,2,2,1,2,1,1,3,3,3,3,2,2,2,1,2,2,2,2,1,2,1,1,3,3,3,3,
			2,2,2,1,2,2,2,2,1,2,1,1,3,3,3,3,2,2,2,1,2,2,2,2,1,3,1,1,3,3,3,3,
			2,2,2,1,2,2,2,2,1,2,1,1,3,3,3,3,2,2,2,1,2,2,2,2,1,3,1,1,3,3,3,3,
			2,2,2,1,2,2,2,2,1,2,1,1,3,3,3,3,2,2,2,1,3,2,2,2,1,3,1,1,3,3,3,3];

var opList=[
opBRK,				//0x00
opORA_IX,			//0x01
opNOP_IMMED,		//0x02
opNOP,				//0x03
opTSB_ZP,			//0x04
opORA_ZP,			//0x05
opASL_ZP,			//0x06
opRMB0,				//0x07
opPHP,				//0x08
opORA_IMMED,		//0x09
opASL,				//0x0A
opNOP,				//0x0B
opTSB_ADDRESS,		//0x0C
opORA_ADDRESS,		//0x0D
opASL_ADDRESS,		//0x0E
opBBR0,				//0x0F
opBPL,				//0x10
opORA_IY,			//0x11
opORA_IZP,			//0x12
opNOP,				//0x13
opTRB_ZP,			//0x14
opORA_ZPX,			//0x15
opASL_ZPX,			//0x16
opRMB1,				//0x17
opCLC,				//0x18
opORA_ADDRESSY,		//0x19
opINC,				//0x1A
opNOP,				//0x1B
opTRB_ADDRESS,		//0x1C
opORA_ADDRESSX,		//0x1D
opASL_ADDRESSX,		//0x1E
opBBR1,				//0x1F
opJSR,				//0x20
opAND_IX,			//0x21
opNOP_IMMED,		//0x22
opNOP,				//0x23
opBIT_ZP,			//0x24
opAND_ZP,			//0x25
opROL_ZP,			//0x26
opRMB2,				//0x27
opPLP,				//0x28
opAND_IMMED,		//0x29
opROL,				//0x2A
opNOP,				//0x2B
opBIT_ADDRESS,		//0x2C
opAND_ADDRESS,		//0x2D
opROL_ADDRESS,		//0x2E
opBBR2,				//0x2F
opBMI,				//0x30
opAND_IY,			//0x31
opAND_IZP,			//0x32
opNOP,				//0x33
opBIT_ZPX,			//0x34
opAND_ZPX,			//0x35
opROL_ZPX,			//0x36
opRMB3,				//0x37
opSEC,				//0x38
opAND_ADDRESSY,		//0x39
opDEC,				//0x3A
opNOP,				//0x3B
opBIT_ADDRESSX,		//0x3C
opAND_ADDRESSX,		//0x3D
opROL_ADDRESSX,		//0x3E
opBBR3,				//0x3F
opRTI,				//0x40
opEOR_IX,			//0x41
opNOP_IMMED,		//0x42
opNOP,				//0x43
opNOP_ZP,			//0x44
opEOR_ZP,			//0x45
opLSR_ZP,			//0x46
opRMB4,				//0x47
opPHA,				//0x48
opEOR_IMMED,		//0x49
opLSR,				//0x4A
opNOP,				//0x4B
opJMP_ADDRESS,		//0x4C
opEOR_ADDRESS,		//0x4D
opLSR_ADDRESS,		//0x4E
opBBR4,				//0x4F
opBVC,				//0x50
opEOR_IY,			//0x51
opEOR_IZP,			//0x52
opNOP,				//0x53
opNOP_ZPX,			//0x54
opEOR_ZPX,			//0x55
opLSR_ZPX,			//0x56
opRMB5,				//0x57
opCLI,				//0x58
opEOR_ADDRESSY,		//0x59
opPHY,				//0x5A
opNOP,				//0x5B
opNOP_ADDRESS,		//0x5C
opEOR_ADDRESSX,		//0x5D
opLSR_ADDRESSX,		//0x5E
opBBR5,				//0x5F
opRTS,				//0x60
opADC_IX,			//0x61
opNOP_IMMED,		//0x62
opNOP,				//0x63
opSTZ_ZP,			//0x64
opADC_ZP,			//0x65
opROR_ZP,			//0x66
opRMB6,				//0x67
opPLA,				//0x68
opADC_IMMED,		//0x69
opROR,				//0x6A
opNOP,				//0x6B
opJMP_I,			//0x6C
opADC_ADDRESS,		//0x6D
opROR_ADDRESS,		//0x6E
opBBR6,				//0x6F
opBVS,				//0x70
opADC_IY,			//0x71
opADC_IZP,			//0x72
opNOP,				//0x73
opSTZ_ZPX,			//0x74
opADC_ZPX,			//0x75
opROR_ZPX,			//0x76
opRMB7,				//0x77
opSEI,				//0x78
opADC_ADDRESSY,		//0x79
opPLY,				//0x7A
opNOP,				//0x7B
opJMP_IADDRESSX,	//0x7C
opADC_ADDRESSX,		//0x7D
opROR_ADDRESSX,		//0x7E
opBBR7,				//0x7F
opBRA,				//0x80
opSTA_IX,			//0x81
opNOP_IMMED,		//0x82
opNOP,				//0x83
opSTY_ZP,			//0x84
opSTA_ZP,			//0x85
opSTX_ZP,			//0x86
opSMB0,				//0x87	
opDEY,				//0x88
opBIT_IMMED,		//0x89
opTXA,				//0x8A
opNOP,				//0x8B
opSTY_ADDRESS,		//0x8C
opSTA_ADDRESS,		//0x8D
opSTX_ADDRESS,		//0x8E
opBBS0,				//0x8F
opBCC,				//0x90
opSTA_IY,			//0x91
opSTA_IZP,			//0x92
opNOP,				//0x93
opSTY_ZPX,			//0x94
opSTA_ZPX,			//0x95
opSTX_ZPY,			//0x96
opSMB1,				//0x97
opTYA,				//0x98
opSTA_ADDRESSY,		//0x99
opTXS,				//0x9A
opNOP,				//0x9B
opSTZ_ADDRESS,		//0x9C
opSTA_ADDRESSX,		//0x9D
opSTZ_ADDRESSX,		//0x9E
opBBS1,				//0x9F
opLDY_IMMED,		//0xA0
opLDA_IX,			//0xA1
opLDX_IMMED,		//0xA2
opNOP,				//0xA3
opLDY_ZP,			//0xA4
opLDA_ZP,			//0xA5
opLDX_ZP,			//0xA6
opSMB2_ZP,			//0xA7
opTAY,				//0xA8
opLDA_IMMED,		//0xA9
opTAX,				//0xAA
opNOP,				//0xAB
opLDY_ADDRESS,		//0xAC
opLDA_ADDRESS,		//0xAD
opLDX_ADDRESS,		//0xAE
opBBS2,				//0xAF
opBCS,				//0xB0
opLDA_IY,			//0xB1
opLDA_IZP,			//0xB2
opNOP,				//0xB3
opLDY_ZPX,			//0xB4
opLDA_ZPX,			//0xB5
opLDX_ZPY,			//0xB6
opSMB3,				//0xB7
opCLV,				//0xB8
opLDA_ADDRESSY,		//0xB9
opTSX,				//0xBA
opNOP,				//0xBB
opLDY_ADDRESSX,		//0xBC
opLDA_ADDRESSX,		//0xBD
opLDX_ADDRESSY,		//0xBE
opBBS3,				//0xBF
opCPY_IMMED,		//0xC0
opCMP_IX,			//0xC1
opNOP_IMMED,		//0xC2
opNOP,				//0xC3
opCPY_ZP,			//0xC4
opCMP_ZP,			//0xC5
opDEC_ZP,			//0xC6
opSMB4,				//0xC7
opINY,				//0xC8
opCMP_IMMED,		//0xC9
opDEX,				//0xCA
opWAI,				//0xCB
opCPY_ADDRESS,		//0xCC
opCMP_ADDRESS,		//0xCD
opDEC_ADDRESS,		//0xCE
opBBS4,				//0xCF
opBNE,				//0xD0
opCMP_IY,			//0xD1
opCMP_IZP,			//0xD2
opNOP,				//0xD3
opNOP_ZPX,			//0xD4
opCMP_ZPX,			//0xD5
opDEC_ZPX,			//0xD6
opSMB5,				//0xD7
opCLD,				//0xD8
opCMP_ADDRESSY,		//0xD9
opPHX,				//0xDA
opSTP,				//0xDB
opNOP_ADDRESS,		//0xDC
opCMP_ADDRESSX,		//0xDD
opDEC_ADDRESSX,		//0xDE
opBBS5,				//0xDF
opCPX_IMMED,		//0xE0
opSBC_IX,			//0xE1
opNOP_IMMED,		//0xE2
opNOP,				//0xE3
opCPX_ZP,			//0xE4
opSBC_ZP,			//0xE5
opINC_ZP,			//0xE6
opSMB6,				//0xE7
opINX,				//0xE8
opSBC_IMMED,		//0xE9
opNOP,				//0xEA
opNOP,				//0xEB
opCPX_ADDRESS,		//0xEC
opSBC_ADDRESS,		//0xED
opINC_ADDRESS,		//0xEE
opBBS6,				//0xEF
opBEQ,				//0xF0
opSBC_IY,			//0xF1
opSBC_IZP,			//0xF2
opNOP,				//0xF3
opNOP_ZPX,			//0xF4
opSBC_ZPX,			//0xF5
opINC_ZPX,			//0xF6
opSMB7,				//0xF7
opSED,				//0xF8
opSBC_ADDRESSY,		//0xF9
opPLX,				//0xFA
opNOP,				//0xFB
opNOP_ADDRESS,		//0xFC
opSBC_ADDRESSX,		//0xFD
opINC_ADDRESSX,		//0xFE
opBBS7				//0xFF
];

function disByte(byteData)
{
	return "$"+byteData.toString(16).padStart(2,"0");
}

function disWord(byteDataLow, byteDataHigh)
{
	return "$"+(byteDataLow+(byteDataHigh<<8)).toString(16).padStart(4,"0");
}


function disassemble(byteList)
{
	//$ = byte
	//% = word
	instructions=[
		"BRK",			//opBRK,			//0x00
		"ORA ($,X)",	//opORA_IX,			//0x01
		"NOP",			//opNOP_IMMED,		//0x02
		"NOP",			//opNOP,			//0x03
		"TSB $",		//opTSB_ZP,			//0x04
		"ORA $",		//opORA_ZP,			//0x05
		"ASL $",		//opASL_ZP,			//0x06
		"RMB0 $",		//opRMB0,			//0x07
		"PHP",			//opPHP,			//0x08
		"ORA #$",		//opORA_IMMED,		//0x09
		"ASL",			//opASL,			//0x0A
		"NOP",			//opNOP,			//0x0B
		"TSB %",		//opTSB_ADDRESS,	//0x0C
		"ORA %",		//opORA_ADDRESS,	//0x0D
		"ASL %",		//opASL_ADDRESS,	//0x0E
		"BBR0 $,$",		//opBBR0,			//0x0F
		"BPL $",		//opBPL,			//0x10
		"ORA ($),Y",	//opORA_IY,			//0x11
		"ORA ($)",		//opORA_IZP,		//0x12
		"NOP",			//opNOP,			//0x13
		"TRB $",		//opTRB_ZP,			//0x14
		"ORA $,X",		//opORA_ZPX,		//0x15
		"ASL $,X",		//opASL_ZPX,		//0x16
		"RMB1 $",		//opRMB1,			//0x17
		"CLC",			//opCLC,			//0x18
		"ORA %,Y",		//opORA_ADDRESSY,	//0x19
		"INC",			//opINC,			//0x1A
		"NOP",			//opNOP,			//0x1B
		"TRB %",		//opTRB_ADDRESS,	//0x1C
		"ORA %,X",		//opORA_ADDRESSX,	//0x1D
		"ASL %,X",		//opASL_ADDRESSX,	//0x1E
		"BBR1 $,$",		//opBBR1,			//0x1F
		"JSR %",		//opJSR,			//0x20
		"AND ($,X)",	//opAND_IX,			//0x21
		"NOP",			//opNOP_IMMED,		//0x22
		"NOP",			//opNOP,			//0x23
		"BIT $",		//opBIT_ZP,			//0x24
		"AND $",		//opAND_ZP,			//0x25
		"ROL $",		//opROL_ZP,			//0x26
		"RMB $",		//opRMB2,			//0x27
		"PLP",			//opPLP,			//0x28
		"AND #$",		//opAND_IMMED,		//0x29
		"ROL",			//opROL,			//0x2A
		"NOP",			//opNOP,			//0x2B
		"BIT %",		//opBIT_ADDRESS,	//0x2C
		"AND %",		//opAND_ADDRESS,	//0x2D
		"ROL %",		//opROL_ADDRESS,	//0x2E
		"BBR2 $,$",		//opBBR2,			//0x2F
		"BMI $",		//opBMI,			//0x30
		"AND ($),Y",	//opAND_IY,			//0x31
		"AND ($)",		//opAND_IZP,		//0x32
		"NOP",			//opNOP,			//0x33
		"BIT $,X",		//opBIT_ZPX,		//0x34
		"AND $,X",		//opAND_ZPX,		//0x35
		"ROL $,X",		//opROL_ZPX,		//0x36
		"RMB3 $",		//opRMB3,			//0x37
		"SEC",			//opSEC,			//0x38
		"AND %,Y",		//opAND_ADDRESSY,	//0x39
		"DEC",			//opDEC,			//0x3A
		"NOP",			//opNOP,			//0x3B
		"BIT %,X",		//opBIT_ADDRESSX,	//0x3C
		"AND %,X",		//opAND_ADDRESSX,	//0x3D
		"ROL %,X",		//opROL_ADDRESSX,	//0x3E
		"BBR3 $,$",		//opBBR3,			//0x3F
		"RTI",			//opRTI,			//0x40
		"EOR ($,X)",	//opEOR_IX,			//0x41
		"NOP",			//opNOP_IMMED,		//0x42
		"NOP",			//opNOP,			//0x43
		"NOP",			//opNOP_ZP,			//0x44
		"EOR $",		//opEOR_ZP,			//0x45
		"LSR $",		//opLSR_ZP,			//0x46
		"RMB4 $",		//opRMB4,			//0x47
		"PHA",			//opPHA,			//0x48
		"EOR #$",		//opEOR_IMMED,		//0x49
		"LSR",			//opLSR,			//0x4A
		"NOP",			//opNOP,			//0x4B
		"JMP %",		//opJMP_ADDRESS,	//0x4C
		"EOR %",		//opEOR_ADDRESS,	//0x4D
		"LSR %",		//opLSR_ADDRESS,	//0x4E
		"BBR4 $,$",		//opBBR4,			//0x4F
		"BVC $",		//opBVC,			//0x50
		"EOR ($),Y",	//opEOR_IY,			//0x51
		"EOR ($)",		//opEOR_IZP,		//0x52
		"NOP",			//opNOP,			//0x53
		"NOP",			//opNOP_ZPX,		//0x54
		"EOR $,X",		//opEOR_ZPX,		//0x55
		"LSR $,X",		//opLSR_ZPX,		//0x56
		"RMB5 $",		//opRMB5,			//0x57
		"CLI",			//opCLI,			//0x58
		"EOR %,Y",		//opEOR_ADDRESSY,	//0x59
		"PHY",			//opPHY,			//0x5A
		"NOP",			//opNOP,			//0x5B
		"NOP",			//opNOP_ADDRESS,	//0x5C
		"EOR %,X",		//opEOR_ADDRESSX,	//0x5D
		"LSR %,X",		//opLSR_ADDRESSX,	//0x5E
		"BBR5 $,$",		//opBBR5,			//0x5F
		"RTS",			//opRTS,			//0x60
		"ADC ($,X)",	//opADC_IX,			//0x61
		"NOP",			//opNOP_IMMED,		//0x62
		"NOP",			//opNOP,			//0x63
		"STZ $",		//opSTZ_ZP,			//0x64
		"ADC $",		//opADC_ZP,			//0x65
		"ROR $",		//opROR_ZP,			//0x66
		"RMB6 $",		//opRMB6,			//0x67
		"PLA",			//opPLA,			//0x68
		"ADC #$",		//opADC_IMMED,		//0x69
		"ROR",			//opROR,			//0x6A
		"NOP",			//opNOP,			//0x6B
		"JMP (%)",		//opJMP_I,			//0x6C
		"ADC %",		//opADC_ADDRESS,	//0x6D
		"ROR %",		//opROR_ADDRESS,	//0x6E
		"BBR6 $,$",		//opBBR6,			//0x6F
		"BVS $",		//opBVS,			//0x70
		"ADC ($),Y",	//opADC_IY,			//0x71
		"ADC ($)",		//opADC_IZP,		//0x72
		"NOP",			//opNOP,			//0x73
		"STZ $,X",		//opSTZ_ZPX,		//0x74
		"ADC $,X",		//opADC_ZPX,		//0x75
		"ROR $,X",		//opROR_ZPX,		//0x76
		"RMB7 $",		//opRMB7,			//0x77
		"SEI",			//opSEI,			//0x78
		"ADC %,Y",		//opADC_ADDRESSY,	//0x79
		"PLY",			//opPLY,			//0x7A
		"NOP",			//opNOP,			//0x7B
		"JMP (%,X)",	//opJMP_IADDRESSX,	//0x7C
		"ADC %,X",		//opADC_ADDRESSX,	//0x7D
		"ROR %,X",		//opROR_ADDRESSX,	//0x7E
		"BBR7 $,$",		//opBBR7,			//0x7F
		"BRA $",		//opBRA,			//0x80
		"STA ($,X)",	//opSTA_IX,			//0x81
		"NOP",			//opNOP_IMMED,		//0x82
		"NOP",			//opNOP,			//0x83
		"STY $",		//opSTY_ZP,			//0x84
		"STA $",		//opSTA_ZP,			//0x85
		"STX $",		//opSTX_ZP,			//0x86
		"SMB0 $",		//opSMB0,			//0x87	
		"DEY",			//opDEY,			//0x88
		"BIT #$",		//opBIT_IMMED,		//0x89
		"TXA",			//opTXA,			//0x8A
		"NOP",			//opNOP,			//0x8B
		"STY %",		//opSTY_ADDRESS,	//0x8C
		"STA %",		//opSTA_ADDRESS,	//0x8D
		"STX %",		//opSTX_ADDRESS,	//0x8E
		"BBS0 $,$",		//opBBS0,			//0x8F
		"BCC $",		//opBCC,			//0x90
		"STA ($),Y",	//opSTA_IY,			//0x91
		"STA ($)",		//opSTA_IZP,		//0x92
		"NOP",			//opNOP,			//0x93
		"STY $,X",		//opSTY_ZPX,		//0x94
		"STA $,X",		//opSTA_ZPX,		//0x95
		"STX $,X",		//opSTX_ZPY,		//0x96
		"SMB1 $",		//opSMB1,			//0x97
		"TYA",			//opTYA,			//0x98
		"STA %,Y",		//opSTA_ADDRESSY,	//0x99
		"TXS",			//opTXS,			//0x9A
		"NOP",			//opNOP,			//0x9B
		"STZ %",		//opSTZ_ADDRESS,	//0x9C
		"STA %,X",		//opSTA_ADDRESSX,	//0x9D
		"STZ %,X",		//opSTZ_ADDRESSX,	//0x9E
		"BBS1 $,$",		//opBBS1,			//0x9F
		"LDY #$",		//opLDY_IMMED,		//0xA0
		"LDA ($,X)",	//opLDA_IX,			//0xA1
		"LDX #$",		//opLDX_IMMED,		//0xA2
		"NOP",			//opNOP,			//0xA3
		"LDY $",		//opLDY_ZP,			//0xA4
		"LDA $",		//opLDA_ZP,			//0xA5
		"LDX $",		//opLDX_ZP,			//0xA6
		"SMB2 $",		//opSMB2_ZP,		//0xA7
		"TAY",			//opTAY,			//0xA8
		"LDA #$",		//opLDA_IMMED,		//0xA9
		"TAX",			//opTAX,			//0xAA
		"NOP",			//opNOP,			//0xAB
		"LDY %",		//opLDY_ADDRESS,	//0xAC
		"LDA %",		//opLDA_ADDRESS,	//0xAD
		"LDX %",		//opLDX_ADDRESS,	//0xAE
		"BBS2 $,$",		//opBBS2,			//0xAF
		"BCS $",		//opBCS,			//0xB0
		"LDA ($),Y",	//opLDA_IY,			//0xB1
		"LDA ($)",		//opLDA_IZP,		//0xB2
		"NOP",			//opNOP,			//0xB3
		"LDY $,X",		//opLDY_ZPX,		//0xB4
		"LDA $,X",		//opLDA_ZPX,		//0xB5
		"LDX $,Y",		//opLDX_ZPY,		//0xB6
		"SMB3 $",		//opSMB3,			//0xB7
		"CLV",			//opCLV,			//0xB8
		"LDA %,Y",		//opLDA_ADDRESSY,	//0xB9
		"TSX",			//opTSX,			//0xBA
		"NOP",			//opNOP,			//0xBB
		"LDY %,X",		//opLDY_ADDRESSX,	//0xBC
		"LDA %,X",		//opLDA_ADDRESSX,	//0xBD
		"LDX %,Y",		//opLDX_ADDRESSY,	//0xBE
		"BBS3 $,$",		//opBBS3,			//0xBF
		"CPY #$",		//opCPY_IMMED,		//0xC0
		"CMP ($,X)",	//opCMP_IX,			//0xC1
		"NOP",			//opNOP_IMMED,		//0xC2
		"NOP",			//opNOP,			//0xC3
		"CPY $",		//opCPY_ZP,			//0xC4
		"CMP $",		//opCMP_ZP,			//0xC5
		"DEC $",		//opDEC_ZP,			//0xC6
		"SMB4 $",		//opSMB4,			//0xC7
		"INY",			//opINY,			//0xC8
		"CMP #$",		//opCMP_IMMED,		//0xC9
		"DEX",			//opDEX,			//0xCA
		"WAI",			//opWAI,			//0xCB
		"CPY %",		//opCPY_ADDRESS,	//0xCC
		"CMP %",		//opCMP_ADDRESS,	//0xCD
		"DEC %",		//opDEC_ADDRESS,	//0xCE
		"BBS4 $,$",		//opBBS4,			//0xCF
		"BNE $",		//opBNE,			//0xD0
		"CMP ($),Y",	//opCMP_IY,			//0xD1
		"CMP ($)",		//opCMP_IZP,		//0xD2
		"NOP",			//opNOP,			//0xD3
		"NOP",			//opNOP_ZPX,		//0xD4
		"CMP $,X",		//opCMP_ZPX,		//0xD5
		"DEC $,X",		//opDEC_ZPX,		//0xD6
		"SMB5 $",		//opSMB5,			//0xD7
		"CLD",			//opCLD,			//0xD8
		"CMP %,Y",		//opCMP_ADDRESSY,	//0xD9
		"PHX",			//opPHX,			//0xDA
		"STP",			//opSTP,			//0xDB
		"NOP",			//opNOP_ADDRESS,	//0xDC
		"CMP %,X",		//opCMP_ADDRESSX,	//0xDD
		"DEC %,X",		//opDEC_ADDRESSX,	//0xDE
		"BBS5 $,$",		//opBBS5,			//0xDF
		"CPX #$",		//opCPX_IMMED,		//0xE0
		"SBC ($,X)",	//opSBC_IX,			//0xE1
		"NOP",			//opNOP_IMMED,		//0xE2
		"NOP",			//opNOP,			//0xE3
		"CPX $",		//opCPX_ZP,			//0xE4
		"SBC $",		//opSBC_ZP,			//0xE5
		"INC $",		//opINC_ZP,			//0xE6
		"SMB6 $",		//opSMB6,			//0xE7
		"INX",			//opINX,			//0xE8
		"SBC #$",		//opSBC_IMMED,		//0xE9
		"NOP",			//opNOP,			//0xEA
		"NOP",			//opNOP,			//0xEB
		"CPX %",		//opCPX_ADDRESS,	//0xEC
		"SBC %",		//opSBC_ADDRESS,	//0xED
		"INC %",		//opINC_ADDRESS,	//0xEE
		"BBS6 $,$",		//opBBS6,			//0xEF
		"BEQ $",		//opBEQ,			//0xF0
		"SBC ($),Y",	//opSBC_IY,			//0xF1
		"SBC ($)",		//opSBC_IZP,		//0xF2
		"NOP",			//opNOP,			//0xF3
		"NOP",			//opNOP_ZPX,		//0xF4
		"SBC $,X",		//opSBC_ZPX,		//0xF5
		"INC $,X",		//opINC_ZPX,		//0xF6
		"SMB7 $",		//opSMB7,			//0xF7
		"SED",			//opSED,			//0xF8
		"SBC %,Y",		//opSBC_ADDRESSY,	//0xF9
		"PLX",			//opPLX,			//0xFA
		"NOP",			//opNOP,			//0xFB
		"NOP",			//opNOP_ADDRESS,	//0xFC
		"SBC %,X",		//opSBC_ADDRESSX,	//0xFD
		"INC %,X",		//opINC_ADDRESSX,	//0xFE
		"BBS7 $,$",		//opBBS7			//0xFF
		];
	let temp_str=instructions[byteList[0]];
	let byteIndex=1;
	let ret_str="";
	for (let i=0;i<temp_str.length;i++)
	{
		if (temp_str[i]=="$")
		{
			ret_str+=disByte(byteList[byteIndex++]);
		}
		else if (temp_str[i]=="%")
		{
			ret_str+=disWord(byteList[byteIndex],byteList[byteIndex+1]);
			byteIndex+=2;
		}
		else
		{
			ret_str+=temp_str[i];
		}
	}
	ret_str=ret_str.toUpperCase().padEnd(12," ");
	return ret_str;
}


