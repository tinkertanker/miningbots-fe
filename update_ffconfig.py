#!/usr/bin/python3
import sys,os,re,functools
# if no name=value pairs specified, show a usage
if len(sys.argv)-1==0: print("Usage: ./update_ffconfig.py (${NAME}=${VALUE})*")
settings=open(os.path.join(os.path.dirname(os.path.realpath(__file__)),"firefox-chrome","user.js"))
setting_lines=list(filter(lambda setting: len(setting)>0,map(lambda setting:setting.strip(),settings.read().split(';')))) # setting_lines is a list of strings containing each line of the user.js file
settings.close()
for i in range(len(setting_lines)):
    setting=setting_lines[i]
    if matches:=re.match(r'user_pref\("([A-Za-z\.]+)",(.+)\)$',setting):
        for update in sys.argv[1:]: # for each name=value pair,
            name, value = tuple(update.split('=')) # get the name and value.
            if matches.group(1)==name: # IF the current setting being inspected matches with the name,
                print("Updating %s (%s -> %s)"%(name,matches.group(2),value))
                setting=setting_lines[i]="user_pref(\"%s\",%s)"%(name,value) # update it.

#write the settings back to the file
settings=open(os.path.join(os.path.dirname(os.path.realpath(__file__)),"firefox-chrome","user.js"),'w')
settings.write(functools.reduce(lambda a,b:a+b+';\n',setting_lines,'').strip())

