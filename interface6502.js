
//***********
//*CONSTANTS*
//***********

//(would be better as separate file but import feature in JS is total trash
//import {ColorTable} from '/ColorTable.js'

//Room for 256 values!

const ColorTable=[
/*
[0  ,0  ,0  ],		//0 = black
[255,0  ,0  ],		//1 = red
[0  ,255,0  ],		//2 = green
[0  ,0  ,255],		//3 = blue
[255,255,0  ],		//4 = yellow
[255,0  ,255],		//5 = purple
[0  ,255,255],		//6 = cyan
[255,255,255],		//7 = white
*/
[0  ,0  ,0  ],		//0 = black
[84 ,0  ,0  ],		//1 = dark red		
[168,0  ,0  ],		//2 = middle red
[255,0  ,0  ],		//3 = red
[0  ,84 ,0  ],		//4 = dark green
[84 ,84 ,0  ],		//5 = dark yellow
[168,84 ,0  ],		//6 = brown
[255,84 ,0  ],		//7 = orange
[0  ,168,0  ],		//8 = middle green
[84 ,168,0  ],		//9
[168,168,0  ],		//10 = middle yellow
[255,168,0  ],		//11 = bright orange
[0  ,255,0  ],		//12 = green
[84 ,255,0  ],		//13 = bright green
[168,255,0  ],		//14 = lime green
[255,255,0  ],		//15 = yellow
[0  ,0  ,84 ],		//16 = dark blue
[84 ,0  ,84 ],		//17 = dark purple	
[168,0  ,84 ],		//18
[255,0  ,84 ],		//19 = bright pink
[0  ,84 ,84 ],		//20 = dark cyan
[84 ,84 ,84 ],		//21 = dark gray
[168,84 ,84 ],		//22
[255,84 ,84 ],		//23 = sunset orange
[0  ,168,84 ],		//24
[84 ,168,84 ],		//25
[168,168,84 ],		//26 = mustard
[255,168,84 ],		//27 = light orange
[0  ,255,84 ],		//28
[84 ,255,84 ],		//29
[168,255,84 ],		//30
[255,255,84 ],		//31 = bright yellow
[0  ,0  ,168],		//32 = middle blue
[84 ,0  ,168],		//33
[168,0  ,168],		//34
[255,0  ,168],		//35
[0  ,84 ,168],		//36 = nice blue
[84 ,84 ,168],		//37
[168,84 ,168],		//38
[255,84 ,168],		//39 = other pink
[0  ,168,168],		//40 = middle cyan
[84 ,168,168],		//41
[168,168,168],		//42 = middle gray
[255,168,168],		//43 = peach
[0  ,255,168],		//44
[84 ,255,168],		//45
[168,255,168],		//46
[255,255,168],		//47 = light yellow
[0  ,0  ,255],		//48 = blue
[84 ,0  ,255],		//49
[168,0  ,255],		//50
[255,0  ,255],		//51 = purple
[0  ,84 ,255],		//52
[84 ,84 ,255],		//53
[168,84 ,255],		//54 
[255,84 ,255],		//55 = brighter purple
[0  ,168,255],		//56 
[84 ,168,255],		//57
[168,168,255],		//58 = lilac?
[255,168,255],		//59 = light pink
[0  ,255,255],		//60 = cyan
[84 ,255,255],		//61 = lighter cyan
[168,255,255],		//62 = lightest cyan
[255,255,255],		//63 = white
//Custom colors
//[20 ,20 ,20 ]		//64 = custom gray

//Fill rest with black in case graphics memory contains invalid values
[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],
[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],
[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],
[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],
[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],
[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],
[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],
[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],
[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],
[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],
[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],
[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],
];

//Virtual screen variables (independent of canvas)
const screenWidth=256;
const screenHeight=128;
const screenPixelRatio=2;


//******************
//*GLOBAL VARIABLES*
//******************

//General state
var ready=0;
var running=0;
var start_time=0;
var cycle_offset=0;
var cycle_temp=0;
var cycle_last=0;
var time_last=0;
var cycle_int_id;
var key_int_id;
var gfx_int_id;
var listing=[];
var draw_address=[-1,-1,-1];
var draw_color=['white','#E0E0E0','#C0C0C0','#00FF00'];

//Worker variable
var w;	

//Canvas drawing variables
var canvas;
var canvasWidth;
var canvasHeight;
var ctx;

//Key buffer
var keyBuffer=[];

//File input buffer
var inputBuffer=[];

//Memory pane address
memLeft=0xC000;
memRight=0xFF00;

//Debug buffer output on page
var debugBufferState="normal";
var debugString="";
var debugBold=false;
var debugItalics=false;
var debugColor="black";
var debugRespan=false;

//Audio for beep on bell character 7
audio=new AudioContext();

//Memory viewer
mem_contents="";

//Cycle log viewer
cycle_log="";

//Constants for hardware
RAM_BANK1=0xFFE0;
RAM_BANK2=0xFFE1;
RAM_BANK3=0xFFE2;
ROM_BANK=0xFFE3;
BANK_SIZE=0x4000;
BANK_COUNT=16;

//Moved to top level html!
//setup();

//**************
//*MESSAGE LOOP*
//**************

function RegCharFilter(character)
{
	if ([0,12].includes(character))
		return String.fromCharCode(1);		//generic box character
	return String.fromCharCode(character);
}

function OnMessage(e)
{
	switch (e.data.cmd)
	{
		case 'update':
			//document.getElementById("lbldebug").innerHTML="debug: " + e.data.debugflag+"<br>";
			document.getElementById("lbldebug").innerHTML=e.data.debugflag+"<br>";
			//if (e.data.loaded==0) alert('Not finished loading!');
			var temp_address=e.data.PC.toString(16).toUpperCase();
			var outstr=
				'<span style="background-color:#00FF00;">PC: ' + 
					"0".repeat(4-e.data.PC.toString(16).length)+
					e.data.PC.toString(16).toUpperCase()+'</span>'+
				"<br>A: " + "0".repeat(2-e.data.A.toString(16).length)+
					e.data.A.toString(16).toUpperCase()+" ("+RegCharFilter(e.data.A)+")"+
				"<br>X: " + "0".repeat(2-e.data.X.toString(16).length)+
					e.data.X.toString(16).toUpperCase()+" ("+RegCharFilter(e.data.X)+")"+
				"<br>Y: " + "0".repeat(2-e.data.Y.toString(16).length)+
					e.data.Y.toString(16).toUpperCase()+" ("+RegCharFilter(e.data.Y)+")"+
				'<br><span style="background-color:cyan;">SP: ' + 
					"0".repeat(2-e.data.SP.toString(16).length)+
					e.data.SP.toString(16).toUpperCase()+'</span>'+
				'<br><span style="background-color:#FF00FF;">CA: '
			if (e.data.CalcAddress==-1) outstr+='(none)</span>';
			else outstr+="0".repeat(4-e.data.CalcAddress.toString(16).length)+
				e.data.CalcAddress.toString(16).toUpperCase()+'</span>'
			outstr+="<br><br>";
			if (e.data.FlagC) outstr+='C ';else outstr+='c ';
			if (e.data.FlagZ) outstr+='Z ';else outstr+='z ';
			if (e.data.FlagI) outstr+='I ';else outstr+='i ';
			if (e.data.FlagD) outstr+='D ';else outstr+='d ';
			if (e.data.FlagB) outstr+='B ';else outstr+='b ';
			if (e.data.FlagV) outstr+='V ';else outstr+='v ';
			if (e.data.FlagN) outstr+='N';else outstr+='n';
			document.getElementById("lblRegs").innerHTML=outstr;
			
			outstr="";
			for (let i=1;i<5;i++)
				outstr+=GetBankFromReg(i,e);
			document.getElementById("lblBanks").innerHTML=outstr;
			
			document.getElementById("lblZP").innerHTML=DrawMem(0x0000,e);
			document.getElementById("lblStack").innerHTML=DrawMem(0x0100,e);
			if (document.getElementById("selLeftPC").checked==true) memLeft = e.data.PC&0xFF00;
			if ((document.getElementById("selRightPC").checked==true)&&(e.data.CalcAddress!=-1)) memRight = e.data.CalcAddress&0xFF00;
			document.getElementById("lblLeftMem").innerHTML=DrawMem(memLeft,e);
			document.getElementById("lblRightMem").innerHTML=DrawMem(memRight,e);
			document.getElementById("lblLeftMemTitle").innerHTML="<b>"+GetBank(memLeft,e)+":"+memLeft.toString(16).toUpperCase().padStart(4,"0")+"</b>";
			document.getElementById("lblRightMemTitle").innerHTML="<b>"+GetBank(memRight,e)+":"+memRight.toString(16).toUpperCase().padStart(4,"0")+"</b>";
			
			if (document.getElementById("tableMemory").style.display=="table")
			{
				w.postMessage({cmd:'memory viewer'});
			}
			
			
			let listing_str="";
			if (ready==1)
			{
				//Old style Kowalski listing
				if (listing_type=="Kowalski")
				{
					var old_address=-1;
					for (let i=0;i<listing.length;i++)
					{
						if (old_address!=listing[i].address)
						{
							if (old_address!=-1) listing_str+='</span>';
							listing_str+='<span id="s'+listing[i].address+'">';
							old_address=listing[i].address;
						}
						
						temp_address=listing[i].address.toString(16).toUpperCase();
						temp_address="0".repeat(4-temp_address.length)+temp_address;
						
						if (listing[i].label!='')
						{
							listing[i].label=listing[i].label.replace("<","&lt;");
							listing[i].label=listing[i].label.replace(">","&gt;");
							listing_str+=temp_address+ " " +listing[i].label+":";
						}
						else
						{
							listing[i].op=listing[i].op.replace("<","&lt;");
							listing[i].op=listing[i].op.replace(">","&gt;");
							listing_str+=temp_address+ " " + listing[i].op;
						}
						listing_str+="<br>";
					}
					listing_str+='</span>';
				}
				else
				{
					//New style CA65 and AS listing
					let old_address=-1;
					let temp_address='';
					for (let i=0;i<listing.length;i++)
					{
						if (old_address!=listing[i].address)
						{
							if (old_address!=-1) listing_str+='</span>';
							listing_str+='<span id="s'+listing[i].address+'">';
							old_address=listing[i].address;
							temp_address=listing[i].address.toString(16).toUpperCase();
							temp_address="0".repeat(4-temp_address.length)+temp_address;
						}
						if (listing[i].line!='')
						{
							listing[i].line=listing[i].line.replace("<","&lt;");
							listing[i].line=listing[i].line.replace(">","&gt;");
							listing_str+=temp_address+" "+listing[i].line;
						}
						listing_str+="<br>";
					}
					listing_str+='</span>';
				}
				
				var sysShow=document.getElementById("tableSystem").style.display;
				document.getElementById("tableSystem").style.display="table";
				var temp_height=document.getElementById('bottom_row').offsetHeight;
				document.getElementById("divlisting").style.height=temp_height+'px';
				document.getElementById("txtlisting").innerHTML=listing_str;
				document.getElementById("tableSystem").style.display=sysShow;
				
				ready=2;
			}
			
			//Leave coloring as is if PC is inside macro
			if (ready==2)
			{
				if (document.getElementById("s"+e.data.PC)!=null)
				{
					for (let j=0;j<3;j++)
					{
						if (draw_address[j]!=-1)
						{
							if (document.getElementById("s"+draw_address[j])!=null)
								document.getElementById("s"+draw_address[j]).style.backgroundColor=draw_color[j];
						}
						if (j<2) draw_address[j]=draw_address[j+1];
					}
					draw_address[2]=e.data.PC;
					if (document.getElementById("s"+e.data.PC)!=null)
						document.getElementById("s"+e.data.PC).style.backgroundColor=draw_color[3];		
					
					document.getElementById('divlisting').scrollTop=document.getElementById("s"+e.data.PC).offsetTop-80;
				}
			}
			break;
		case "msgbox": 
			alert(e.data.msg);
			break;
		case "error":
			alert("Error: " + e.data.msg);
			break;
		case "status":
			document.getElementById("lblstatus").innerHTML="Status: " + e.data.msg;
			break;
		case "ready":
			ready=1;
			w.postMessage({cmd:'update'});
			break;
		case "cycles":
			//Average speed since began running
			/*
			var t0=performance.now();
			cycle_temp=e.data.cycle_count;
			document.getElementById("lblspeed").innerHTML="Speed: " + Math.round((e.data.cycle_count-cycle_offset)/(t0-start_time)/10)/100 + "MHz";
			*/
			
			//Average speed since last reading
			var t0=performance.now();
			cycle_temp=e.data.cycle_count;
			if (time_last!=0)
			{
				document.getElementById("lblspeed").innerHTML="Speed: " + Math.round((cycle_temp-cycle_last)/(t0-time_last)/10)/100 + "MHz";
			}
			cycle_last=cycle_temp;
			time_last=t0;
			
			break;
		case "debug":
			if (e.data.debugBuffer.length>0)
			{
				let dlen=e.data.debugBuffer.length;
				for (i=0;i<dlen;i++)
				{
					let newchar=String.fromCharCode(e.data.debugBuffer[i]);
					if (debugBufferState=="normal")
					{
						if (newchar=="\\") debugBufferState="slashed";
						else if (newchar.charCodeAt(0)>=9)
						{
							if (debugRespan)
							{
								debugString+="</span><span style='color:"+debugColor+";";
								if (debugItalics) debugString+="font-style: italic;";
								if (debugBold) debugString+="font-weight: bold;";
								debugString+="'>";
								debugRespan=false;
							}
							if (newchar==" ") debugString+="&nbsp;";
							else if (newchar.charCodeAt(0)==9) debugString+="&#9;";
							else if (newchar.charCodeAt(0)==10) debugString+="<br>";
							else debugString+=newchar;
						}
					}
					else if (debugBufferState=="slashed")
					{
						//Can also check by number here, which is why passed array instead of string
						
						//New line
						if (newchar=="n") debugString+="<br>";
						//Colors
						else if ("roygbpwl".includes(newchar))
						{
							if (newchar=="r") debugColor="red";
							else if (newchar=="o") debugColor="#FF8000";
							else if (newchar=="y") debugColor="#E0E000";
							else if (newchar=="g") debugColor="#00E000";
							else if (newchar=="b") debugColor="#0000FF";
							else if (newchar=="p") debugColor="#FF00FF";
							else if (newchar=="w") debugColor="white";
							else if (newchar=="l") debugColor="black";
							debugRespan=true;
						}						
						//Bold, Italics, Reset
						else if (newchar=="B") {debugBold=true;debugRespan=true;}
						else if (newchar=="I") {debugItalics=true;debugRespan=true;}
						else if (newchar=="R")
						{
							debugBold=false;
							debugItalics=false;
							debugRespan=true;
						}
						//Not found so treat as not slashed
						else debugString+="\\"+newchar;
						debugBufferState="normal";
					}
				}
				document.getElementById('divDebug').innerHTML="<span>"+debugString+"</span>";
				//document.getElementById('divDebug').scrollTop=document.getElementById('divDebug').scrollHeight-document.getElementById('divDebug').offsetHeight;
				document.getElementById('divDebug').scrollTop=document.getElementById('divDebug').scrollHeight;
			}
			break;
		case "stopped":
			w.postMessage({cmd:'update'});
			w.postMessage({cmd:'debug'});
			w.postMessage({cmd:'check screen'});
			clearInterval(cycle_int_id);
			clearInterval(key_int_id);
			clearInterval(gfx_int_id);
			cycle_last=0;
			time_last=0;
			document.getElementById("lblspeed").innerHTML="Speed: (stopped)";
			running=0;
			break;
		case "listing":
			listing=e.data.listing;
			break;
		case "screen update":
			//let draw_start_time=Date.now();
				//Total: 			150-270ms
				//getImageDate: 	0-1ms
				//data=imdageData: 	0-1ms
				//for loop:			150-260ms	<===THIS IS THE PROBLEM
				//putImageData:		01-ms
				
			//Tried but didn't work
				//made data const
				//changed data in loop to imageData.data
				//commented out alpha value (alreadys set?)
				
			//Tried and worked	
				//cache ColorTable entry	13-70ms
			
			//Hmm, cant use imageData here since used above if use let :/
			var imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
			var index=0;
			//const???
			const data = imageData.data;
			for (let j=0;j<screenHeight;j++)
			{
				for (let i=0;i<screenWidth;i++)
				{
					let k=i+j*screenWidth;
					//first pixel
					let temp_color=ColorTable[e.data.screenMem[k]];
					let temp_r=temp_color[0];
					let temp_g=temp_color[1];
					let temp_b=temp_color[2];
					
					//Was like this for each pixel
					/*
					data[index++]=ColorTable[e.data.screenMem[k]][0];
					data[index++]=ColorTable[e.data.screenMem[k]][1];
					data[index++]=ColorTable[e.data.screenMem[k]][2];
					data[index++]=255;
					*/
					data[index++]=temp_r;
					data[index++]=temp_g;
					data[index++]=temp_b;
					data[index++]=255;
					
					//x+1
					data[index++]=temp_r;
					data[index++]=temp_g;
					data[index++]=temp_b;
					data[index++]=255;
					
					//y+1
					index+=canvasWidth*4-2*4;
					data[index++]=temp_r;
					data[index++]=temp_g;
					data[index++]=temp_b;
					data[index++]=255;
					
					//x+1,y+1
					data[index++]=temp_r;
					data[index++]=temp_g;
					data[index++]=temp_b;
					data[index++]=255;	
					//reset
					index-=canvasWidth*4;
				}
				index+=canvasWidth*4
			}
			//alert(Date.now()-draw_start_time);
			ctx.putImageData(imageData, 0, 0);
			break;
		case "cycle log":
			//alert(e.data.log);
			let elementLog = document.createElement('a');
			elementLog.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(e.data.log));
			elementLog.setAttribute('download', 'cycle log.txt');
			elementLog.style.display = 'none';
			document.body.appendChild(elementLog);
			elementLog.click();
			document.body.removeChild(elementLog);			
			break;
		case "memory dump":
			let elementMem = document.createElement('a');
			elementMem.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(e.data.memDump));
			elementMem.setAttribute('download', 'memory dump.txt');
			elementMem.style.display = 'none';
			//alert(e.data.memDump.length);//system
			document.body.appendChild(elementMem);
			elementMem.click();
			document.body.removeChild(elementMem);			
			break;
		case "memory viewer":
			mem_contents=DrawMemViewer(e.data.mem);
			break;
		case "cycle table":
			cycle_log=e.data.cycleLog;
			cycle_log_temp=cycle_log.replace(/\n/g,"<br>");
			cycle_log_temp=cycle_log_temp.replace(/ /g,"&nbsp;");
			document.getElementById('divCycles').innerHTML=cycle_log_temp;
			break;
		case "bell":
			beep(2,880,200);
			break;
	}	
}

//Get string representing bank from address
function GetBank(address,e)
{
	if (address<0x200) bank=0;
	else if (address<0x4000) bank=parseInt(e.data.RamBank1/BANK_SIZE);
	else if (address<0x8000) bank=parseInt(e.data.RamBank2/BANK_SIZE);
	else if (address<0xC000) bank=parseInt(e.data.RamBank3/BANK_SIZE);
	else bank=parseInt(e.data.RomBank/BANK_SIZE);
	return bank.toString(16).toUpperCase().padStart(2,"0")
}

//Get string representing bank from bank regs
function GetBankFromReg(bank,e)
{
	let bankPC=-1;
	let bankCA=-1;
	if (e.data.PC<0x200) bankPC=-1;
	else if (e.data.PC<0x4000) bankPC=1;
	else if (e.data.PC<0x8000) bankPC=2;
	else if (e.data.PC<0xC000) bankPC=3;
	else bankPC=4;

	if (e.data.CalcAddress<0x200) bankCA=-1;
	else if (e.data.CalcAddress<0x4000) bankCA=1;
	else if (e.data.CalcAddress<0x8000) bankCA=2;
	else if (e.data.CalcAddress<0xC000) bankCA=3;
	else bankCA=4;
	
	let disp_bank=-1;
	if (bank==1) disp_bank=parseInt(e.data.RamBank1/BANK_SIZE);
	else if (bank==2) disp_bank=parseInt(e.data.RamBank2/BANK_SIZE);
	else if (bank==3) disp_bank=parseInt(e.data.RamBank3/BANK_SIZE);
	else if (bank==4) disp_bank=parseInt(e.data.RomBank/BANK_SIZE);
	
	if (bank==bankPC) outstr='<span style="background-color:#00FF00;">';
	else if (bank==bankCA) outstr='<span style="background-color:#FF00FF;">';
	else outstr='<span>';
	outstr+="Bank "+bank.toString(16)+": "+"0".repeat(2-disp_bank.toString(16).length);
	outstr+=disp_bank.toString(16)+"</span><br>";
	return outstr;
}

function selLeftHandler()
{
	memLeft = document.getElementById("selLeftMem").selectedIndex*0x100;
	w.postMessage({cmd:'update'});
}

function selRightHandler()
{
	memRight = document.getElementById("selRightMem").selectedIndex*0x100;
	w.postMessage({cmd:'update'});
}

function keyHandler(event)
{
	let keyName = event.key;
	let key=0;
	//keyName=undefined;
	if (keyName!=undefined)
	{
		//Default behavior - Chrome 51 and up
		switch (keyName)
		{	
			case "Shift":
				key=0;
				break;
			case "Alt":
				key=0;
				break;
			case "Enter":
				key=13;
				break;
			case "Backspace":
				key=8;
				break;
			case "Escape":
				key=27;
				break;
			default:
				//If length>1 then might be a named key like "Backspace"
				if (keyName.length==1) key=keyName.charCodeAt(0)&0xFF;
				break;
		}
		//console.log("\nHTML side key (default): "+key);
	}
	else
	{
		//Compatibility version - Chrome 50 and under
		keyName=event.code;
		//console.log("\nHTML side key (deprecated): "+keyName);
		const unshifted={KeyA:97,KeyB:98,KeyC:99,KeyD:100,KeyE:101,KeyF:102,KeyG:103,KeyH:104,KeyI:105,KeyJ:106,KeyK:107,KeyL:108,
		KeyM:109,KeyN:110,KeyO:111,KeyP:112,KeyQ:113,KeyR:114,KeyS:115,KeyT:116,KeyU:117,KeyV:118,KeyW:119,KeyX:120,KeyY:121,KeyZ:122,
		Digit0:48,Digit1:49,Digit2:50,Digit3:51,Digit4:52,Digit5:53,Digit6:54,Digit7:55,Digit8:56,Digit9:57,
		Comma:44,Period:46,Slash:47,Semicolon:59,Quote:39,BracketLeft:91,BracketRight:93,Backslash:92,Minus:45,Equal:61,Backspace:8,
		Enter:13,Tab:0,Backquote:96,Delete:0,Space:32};
		
		const shifted={KeyA:65,KeyB:66,KeyC:67,KeyD:68,KeyE:69,KeyF:70,KeyG:71,KeyH:72,KeyI:73,KeyJ:74,KeyK:75,KeyL:76,KeyM:77,
		KeyN:78,KeyO:79,KeyP:80,KeyQ:81,KeyR:82,KeyS:83,KeyT:84,KeyU:85,KeyV:86,KeyW:87,KeyX:88,KeyY:89,KeyZ:90,
		Digit0:41,Digit1:33,Digit2:64,Digit3:35,Digit4:36,Digit5:37,Digit6:94,Digit7:38,Digit8:42,Digit9:40,
		Comma:60,Period:62,Slash:63,Semicolon:58,Quote:34,BracketLeft:123,BracketRight:125,Backslash:124,Minus:95,Equal:43,Backspace:8,
		Enter:13,Tab:0,Backquote:126,Delete:0,Space:32};
		
		if (event.shiftKey) key=shifted[keyName];
		else key=unshifted[keyName];
		if (key==undefined) key=0;
		
		//console.log("HTML side key code (deprecated): "+key);
	}
	
	//Add to buffer and send all at once every 10ms (disabled)
	//keyBuffer.push(keyName);
	
	//Send immediately
	//w.postMessage({cmd:'keys',keys:key});
	
	//Prevent default behavior, including typing and scrolling on space
		//Exceptions for ctrl+R, ctrl+C, ctrl+F
	//if (!((keyName=='r')&&(event.ctrlKey))) event.preventDefault();
	
	if (!event.ctrlKey)
	{	
		w.postMessage({cmd:'keys',keys:key});
		event.preventDefault();
	}
	else
	{
		if (keyName=='c');
		else if (keyName=='f');
		else if (keyName=='r');
		else if (keyName=='a');
		else
		{
			w.postMessage({cmd:'keys',keys:key});
			event.preventDefault();
		}	
	}
}

// https://hackernoon.com/copying-text-to-clipboard-with-javascript-df4d4988697f
function copyToClipboard(text)
{
  const el = document.createElement('textarea');
  el.value = text;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}

function radioHandler(whichRadio)
{
	document.getElementById("tableLegend").style.display="none";
	document.getElementById("tableLegend2").style.display="none";
	document.getElementById("tableDebug").style.display="none";
	document.getElementById("tableSystem").style.display="none";
	document.getElementById("tableMemory").style.display="none";
	document.getElementById("tableCycles").style.display="none";
	if (whichRadio.value=="legend")
	{
		document.getElementById("tableLegend").style.width=
			document.getElementById("tableMain").offsetWidth-34+"px";
		document.getElementById("tableLegend").style.display="block";
	}
	else if (whichRadio.value=="legend2")
	{
		document.getElementById("tableLegend2").style.width=
			document.getElementById("tableMain").offsetWidth-34+"px";
		document.getElementById("tableLegend2").style.display="block";
	}
	else if (whichRadio.value=="system")
	{
		document.getElementById("tableDebug").style.display="table";
		document.getElementById("tableDebug").style.width=
			document.getElementById("tableMain").offsetWidth+"px";
		document.getElementById("divDebug").style.width=
			document.getElementById("tableMain").offsetWidth+"px";	
		document.getElementById("tableSystem").style.display="table";
		//Reset listing window
		w.postMessage({cmd:'update'});	
		//Scroll debug window to bottom
		document.getElementById('divDebug').scrollTop=document.getElementById('divDebug').scrollHeight-document.getElementById('divDebug').offsetHeight;
	}	
	else if (whichRadio.value=="stack") document.getElementById("tableStack").style.display="table";
	else if (whichRadio.value=="memory")
	{
		document.getElementById("tableMemory").style.width=
			document.getElementById("tableMain").offsetWidth+"px";
		document.getElementById("tableMemory").style.display="table";
		w.postMessage({cmd:'memory viewer'});
	}
	else if (whichRadio.value=="cycles")
	{
		document.getElementById("tableCycles").style.width=
			document.getElementById("tableMain").offsetWidth+"px";
		document.getElementById("tableCycles").style.display="table";
		w.postMessage({cmd:'cycle table'});
	}
	
}

//Old DrawMem that ignores banking
/*
function DrawMem(StartAddress,e)
{
	var outstr='&nbsp;&nbsp;&nbsp;<span style="background-color:#C0C0C0;">'+
		'x0 x1 x2 x3 x4 x5 x6 x7 x8 x9 xA xB xC xD xE xF<br>0x</span> ';
	for (let i=StartAddress;i<StartAddress+0x100;i++)
	{
		if (i==0x100+e.data.SP) outstr+='<span style="background-color:cyan;">';
		else if (i==e.data.PC)
		{
			outstr+='<span style="background-color:#00FF00;">';
		}
		else if (i==e.data.CalcAddress) outstr+='<span style="background-color:#FF00FF;">';
		else
		{
			if (i%2==1) outstr+='<span style="background-color:#FFFFFF;">';
			else outstr+='<span style="background-color:#E0E0E0;">';
		}
		if (e.data.mem[i]<0x10) outstr+='0';
		outstr+=e.data.mem[i].toString(16).toUpperCase()+'</span>'
		if ((i%16==15)&&((i%0x100)!=0xFF)) outstr+='<br><span style="background-color:#C0C0C0;">'+
			parseInt((i%0x100)/16+1).toString(16).toUpperCase()+'x</span> ';
		else outstr+=' ';
	}
	return outstr;
}
*/

function DrawMem(StartAddress,e)
{
	var outstr='&nbsp;&nbsp;&nbsp;<span style="background-color:#C0C0C0;">'+
		'x0 x1 x2 x3 x4 x5 x6 x7 x8 x9 xA xB xC xD xE xF<br>0x</span> ';
	if (StartAddress<0x200)
	{	
		BankAddress=StartAddress;
	}
	else if (StartAddress<0x4000)
	{
		BankAddress=StartAddress+e.data.RamBank1;
	}
	else if (StartAddress<0x8000)
	{
		BankAddress=StartAddress-0x4000+e.data.RamBank2;
	}	
	else if (StartAddress<0xC000)
	{
		BankAddress=StartAddress-0x8000+e.data.RamBank3;
	}
	else
	{
		BankAddress=StartAddress-0xC000+e.data.RomBank;
	}
		
	for (let i=StartAddress;i<StartAddress+0x100;i++)
	{
		if (i==0x100+e.data.SP) outstr+='<span style="background-color:cyan;">';
		else if (i==e.data.PC)
		{
			outstr+='<span style="background-color:#00FF00;">';
		}
		else if (i==e.data.CalcAddress) outstr+='<span style="background-color:#FF00FF;">';
		else
		{
			if ((i)%2==1) outstr+='<span style="background-color:#FFFFFF;">';
			else outstr+='<span style="background-color:#E0E0E0;">';
		}
		if (e.data.mem[i-StartAddress+BankAddress]<0x10) outstr+='0';
		outstr+=e.data.mem[i-StartAddress+BankAddress].toString(16).toUpperCase()+'</span>'
		if ((i%16==15)&&((i%0x100)!=0xFF)) outstr+='<br><span style="background-color:#C0C0C0;">'+
			parseInt((i%0x100)/16+1).toString(16).toUpperCase()+'x</span> ';
		else outstr+=' ';
	}
	return outstr;
}

function DrawMemViewer(mem)
{
	temp_str='<span>';
	for (let i=0;i<BANK_COUNT;i++)
	{
		temp_str+='<a name="bank'+i+'"></a>'	;
		temp_str+="<center><b>Bank "+i.toString(16).toUpperCase().padStart(2,"0");
		temp_str+="</b></center><br>";
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
				temp_str+=temp_vals+"| "+temp_chars+"<br>";
				temp_chars="";
				temp_vals="";
			}
		}
		temp_str+="<br>";
	}
	temp_str+='</span>';
	document.getElementById('divMemory').innerHTML=temp_str;
	
	temp_str=temp_str.replace(/<a>/g,"");
	temp_str=temp_str.replace(/<\/a>/g,"");
	temp_str=temp_str.replace(/<b>/g,"");
	temp_str=temp_str.replace(/<\/b>/g,"");
	temp_str=temp_str.replace(/<center>/g,"");
	temp_str=temp_str.replace(/<\/center>/g,"");
	temp_str=temp_str.replace(/<br>/g,"\n");
	temp_str=temp_str.replace(/<span>/g,"");
	temp_str=temp_str.replace(/<\/span>/g,"");
	temp_str=temp_str.replace(/<a name="bank\d\d?">/g,"");
		
	return temp_str;
}


//https://odino.org/emit-a-beeping-sound-with-javascript/
function beep(vol, freq, duration){
  v=audio.createOscillator();
  u=audio.createGain();
  v.connect(u);
  v.frequency.value=freq;
  v.type="square";
  u.connect(audio.destination);
  u.gain.value=vol*0.01;
  v.start(audio.currentTime);
  v.stop(audio.currentTime+duration*0.001);
}


function step()
{
	if (ready==2)
	{
		w.postMessage({cmd:'single'});
		w.postMessage({cmd:'debug'});
		w.postMessage({cmd:'check screen'});
	}
}

function run()
{
	if ((ready==2)&&(running==0))
	{
		keyBuffer=[];
		inputBuffer=[];
		w.postMessage({cmd:'run'});
		cycle_offset=cycle_temp;
		//cycle_int_id=setInterval(function(){w.postMessage({cmd:'cycles'});},1000);
		cycle_int_id=setInterval(function()
		{
			w.postMessage({cmd:'cycles'});
			w.postMessage({cmd:'debug'});
		}
		,1000);
		
		//Try sending keys immediately
		/*
		key_int_id=setInterval(function()
		{
			if (keyBuffer.length!=0)
			{
				w.postMessage({cmd:'keys',keys:keyBuffer});
				keyBuffer=[];
			}
		},10);
		*/
		
		//Update time is max 13-70ms down from 150-270ms. Update rate of 15ms then?
		//gfx_int_id=setInterval(function(){w.postMessage({cmd:'check screen'});},200);
		gfx_int_id=setInterval(function(){w.postMessage({cmd:'check screen'});},15);
		
		start_time=performance.now();
		running=1;
	}
}

function stop()
{
	if (running==1)
	{
		w.postMessage({cmd:'stop'});
		document.getElementById("lblspeed").innerHTML="Speed: stopping...";
	}
}

function reset()
{
	w.postMessage({cmd:'reset'});
	w.postMessage({cmd:'update'});		
}

function LoadPages()
{
	//https://stackoverflow.com/questions/17636528/how-do-i-load-an-html-page-in-a-div-using-javascript
	var xmlHttp = new XMLHttpRequest();
	
	function xmlStep(file,func)
	{
		xmlHttp.onreadystatechange = function()
		{
			if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
			{
				func();
			}
		}
		xmlHttp.open("GET", file, true); // true for asynchronous
		xmlHttp.send(null);
	}
	
	xmlStep(base_path + "interface.html",
		function()
		{
			//executes after main page loads
			content_div.innerHTML = xmlHttp.responseText;
			setup(path,listing_type);
			xmlStep(legend_page,
				function()
				{
					tableLegend.innerHTML = xmlHttp.responseText;
					if (visible_items.includes("legend2"))
					{
						xmlStep(legend2_page,
							function()
							{
								tableLegend2.innerHTML = xmlHttp.responseText;
							}
						);
					}
				}
			);
		}
	);
}

function setup(hexPath,listing_type)
{
	//Worker
	w = new Worker(base_path+"emu6502.js");
	w.addEventListener('message', OnMessage, false);
	w.postMessage({cmd:'setup',path:hexPath,listing_type:listing_type,NMOS_mode:NMOS_mode});
	
	//Interface
	lbl_legend.innerHTML=legend_caption;
	lbl_legend2.innerHTML=legend2_caption;
	main_title.innerHTML=doc_title;
	for (const item of visible_items)
	{
		if (item!="")
		{
			document.getElementById("br_"+item).style.display="inline-block";
			document.getElementById("lbl_"+item).style.display="inline-block";
			document.getElementById("radio_"+item).style.display="inline-block";
		}
	}

	//Screen
	canvas = document.getElementById('picScreen');
	canvasWidth  = canvas.width;
	canvasHeight = canvas.height;
	ctx = canvas.getContext('2d');
	ctx.font = "16px Lucida Console";
	ctx.fillText("<<Press Run to start", 10, 247);

	//Keyhandler
	document.addEventListener('keydown', keyHandler);
	
	
	//Handle in top level html file instead
	//Hide elements
	//document.getElementById("tableLegend").style.display="table";
	//document.getElementById("tableDebug").style.display="table";
	//document.getElementById("tableSystem").style.display="none";
	//document.getElementById("tableStack").style.display="none";
	
	//Populate memory pane drop downs
	var selLeft = document.getElementById("selLeftMem");
	var selRight = document.getElementById("selRightMem");
	for (i=0;i<=0xFF;i++)
	{
		var option = document.createElement("option");
		option.text = i.toString(16).toUpperCase();
		if (option.text.length==1) option.text='0'+option.text;
		selLeft.add(option);
		var option = document.createElement("option");
		option.text = i.toString(16).toUpperCase();
		if (option.text.length==1) option.text='0'+option.text;
		selRight.add(option);
	}
	document.getElementById("selLeftMem").selectedIndex = 0xC0;
	document.getElementById("selRightMem").selectedIndex = 0xFF;
	
	//Populate function list box
	
	//Moved to top level HTML file
	//Set bottom view
	//radioHandler(document.formModes.radioMode);

	//alert(document.getElementById("obj_height").offsetTop);
	
	//Switch to startup pane after everything is populated
	document.getElementById("radio_"+start_option).checked=true;
	radioHandler(document.formModes.radioMode);
	
}
