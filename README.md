caltrack
========

# what is this?

this is a dumb nodejs server and front end that I made to help with calorie and macronutrient tracking. It's real simple and made for me to use by myself so there aren't a lot of fancy UI features. Mostly it lets me do what I want to do and it's coded in a way to help me test out some ideas I had.

so far I've been running it for over a year with no major crashes or bugs, but that's not that impressive when we are talking about 1 user that's also it's creator.


# how is this code laid out?

there are basically 3 important directories of code `lib`, which contains files the server needs, `src` which is for the front end and `sql` which is for the database.

the server uses [teejay](https://github.com/SQUARE-WAVES/teejay) to be set up, meaning a lot of the code is kinda generic stuff that you fill in details in the configuration. There are 2 configuration files, the environment, which sets up globals (right now the only gloabl is the database connection.) and the server configuration which sets up the routes.

the front end is based around a bit of code I made to kinda-sorta work like elm, but just in JS. I didn't wanna mess with too many dependencies to do like react or vue or whatever the JS framework of the month is, and I didn't wanna do elm because well, no real great reason I just didn't like the way it looked. It's based around [virtual dom](https://github.com/Matt-Esch/virtual-dom) and only really depends on that. However due to modern front ends being what they are that means I also used parcel to build it all. I'm not much of a "front end guy" and I try to avoid doing much stuff with all the various build processes and transpilers and whatnot.

the database folder just has a nice file called "setup.sql" that you can pipe directly into a postgres database and it will set things up the way this app likes. I haven't bothered figuring out a way to do non-postgres or anything more generic, but you should be able to look at that file and figure out what you want if you want to use a different DB, it's only 3 tables and a view.

# how do I build stuff.

the sever doesn't require any build processes, just install the dependencies (I use yarn for that but I think npm will work too I haven't tried.) Just start it up with '''node main.js <env conf path> <server conf path>''' those paths will default to './conf/test.tj' and './conf/server.tj' respectively.

the command I use to build the front end is: 
```
rm -rf ./dist
./node_modules/parcel-bundler/bin/cli.js build $1 --public-url "./"
```

the "public url" parameter is for formatting the links in the frontend files, so you could potentially do them non-relative or something. I'm not sure if this is "best practices" with parcel or whatever but it gets the job done for me. I version the dist folder because I just deploy it as is.

as above to set up the database, just run that setup file.

