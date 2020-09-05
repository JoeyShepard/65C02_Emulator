# 65C02 Emulator

This is a 65C02 emulator created to test firmware for a calculator project. It passes Klaus Dormann's [6502 and 65C02 functional tests](https://github.com/Klaus2m5/6502_65C02_functional_tests), with the exception of interrupts. Chrome is recommended as it seems to run the emulator much faster than other browsers reaching up to 50 MHz.

You can see the emulator running on my website: [Robot Game](http://calc6502.com/RobotGame/OptAsm.html).

The emulator displays the registers, memory, and an assembly listing while single stepping. The listing there is a stripped down version of the file output by the assembler used to assemble the file loaded into the emulator. Programs are loaded from a hex file when the page loads. The emulator has 16 banks of 16 kB for a total of 256 kB memory. Memory is divided into four bank windows:

0x0000-0x01FF No banking\
0x0200-0x3FFF Bank 1\
0x4000-0x7FFF Bank 2\
0x8000-0xBFFF Bank 3\
0xC000-0xFFDF Bank 4

Video memory (256x128) is mapped one byte per pixel and takes up the 32k from 0x10000 to 0x17FFFF. Each byte has two bits each of red, green, and blue. Valid color codes are 0-63. Peripherals are mapped starting at 0xFFE0:

0xFFE0 Bank 1 pointer\
0xFFE1 Bank 2 pointer\
0xFFE2 Bank 3 pointer\
0xFFE3 Bank 4 pointer\
0xFFE4 Non-blocking keyboard input\
0xFFE5 Counter. Updates 250 times per second\
0xFFE6 Counter. Updates once per second\
0xFFE7 Output to debug window\
0xFFE8 Hex output to debug window\
0xFFE9 Decimal output to debug window\
0xFFEA 16 bit decimal output to debug window\
0xFFEB Debug counter for measuring cycles\
0xFFEC Turn instruction logging on\
0xFFED Turn instruction logging off\
0xFFEE Send instruction log file
