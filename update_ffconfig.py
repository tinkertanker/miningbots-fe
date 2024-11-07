#!/usr/bin/python3
import sys,os,re,functools
# if no name=value pairs specified, show a usage
if len(sys.argv)-1==0: print("Usage: ./update_ffconfig.py (${NAME}=${VALUE})*")
# read the current config
settings=open(os.path.join(os.path.dirname(os.path.realpath(__file__)),"firefox-chrome","user.js"))
setting_lines=list(\
    # remove any blank lines
    filter(lambda setting: len(setting)>0,\
        # remove extra spaces
        map(lambda setting:setting.strip(),\
            # get each setting. it is semicolon separated
            settings.read().split(';')
        )
    )
)
setting_lines_out=[]
settings.close()
for i in range(len(setting_lines)):
    setting=setting_lines[i]
    # parse the setting
    # remove all the wrapping and quotes
    # TODO: handle errors properly. Currently just ignores errorneous lines and treats them as if they weren't there
    if matches:=re.match(r'user_pref\("([A-Za-z\.]+)",(.+)\)$',setting):
        for update in sys.argv[1:]: # for each name=value pair,
            name, value = tuple(update.split('=')) # get the name and value.
            if matches.group(1)==name: # IF the current setting being inspected matches with the name,
                print("Updating %s (%s -> %s)"%(name,matches.group(2),value))
                setting="user_pref(\"%s\",%s)"%(name,value) # update it with the expected format.
        setting_lines_out.append(setting)
    else:
        raise ValueError("Parsing failed")

#write the settings back to the file
settings=open(os.path.join(os.path.dirname(os.path.realpath(__file__)),"firefox-chrome","user.js"),'w')
settings.write(\
    # use reduce to join with semicolons.
    # NOTE: We didn't use ';\n'.join(setting_lines) as that would cause the semicolon after the last setting to be missing
    functools.reduce(lambda a,b:a+b+';\n',setting_lines_out,'').strip()\
)

