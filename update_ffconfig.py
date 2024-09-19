#!/usr/bin/python3
import sys,os,re,functools
settings=open(os.path.join(os.path.dirname(os.path.realpath(__file__)),"firefox-chrome","user.js"))
setting_lines=list(filter(lambda setting: len(setting)>0,map(lambda setting:setting.strip(),settings.read().split(';'))))
settings.close()
for i in range(len(setting_lines)):
    setting=setting_lines[i]
    if matches:=re.match(r'user_pref\("([A-Za-z\.]+)",(.+)\)$',setting):
        if matches.group(1)==sys.argv[1]:
            print("Updating %s (%s -> %s)"%(sys.argv[1],matches.group(2),sys.argv[2]))
            setting=setting_lines[i]="user_pref(\"%s\",%s)"%tuple(sys.argv[1:])

settings=open(os.path.join(os.path.dirname(os.path.realpath(__file__)),"firefox-chrome","user.js"),'w')
settings.write(functools.reduce(lambda a,b:a+b+';\n',setting_lines,'').strip())

