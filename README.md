# Time tracker

This project was build to keep track of my time at work. 

## Installation

Copy the file [`target/time-tracker.html`](https://github.com/gaellafond/time-tracker/raw/master/target/time-tracker.html)
on your computer and load it on a web browser.

The Time Tracker uses local storage in your browser to save your times and so your data
only exists on your local machine in the one browser that you ran the app. If you switch 
broswers then the time records will not come across. 

We use local storage because the data remains private. No data is sent to any servers.
It also means we don't need to worry about users and passwords in the application.

**NOTE:** If you want to avoid problems, do NOT use **Internet Explorer** or **Edge**.
This advice is also valid for any other website on the Internet.

## Development

The project is split in multiple files.
Therefore, if you want to develop a new feature or fix a bug,
you will need to setup a web server like Apache.

Example of an Apache config file for this project:

```
<VirtualHost *:80>
    ServerName timetracker.localhost

    DocumentRoot /path/to/project/root/time-tracker
    <Directory />
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```
### Required development tools
* Apache server
* Git
* Web browser
* Unix/Linux for building the single final HTML file.

### Development setup on Windows
Note: On a vanilla Windows you will be able to modify and test the code, just not build the final HTML file.

1. **Download Apache server**. Apache does not provide binary releases of the software for Windows and so
apache needs to be installed from a bundle such as [XAMPP](https://www.apachefriends.org/index.html)
or [ApacheHaus](https://www.apachehaus.com/cgi-bin/download.plx). More packages are listed
on the [Apache Server on Windows](https://httpd.apache.org/docs/current/platform/windows.html#down) page.
In this case I will install from `ApacheHaus` as their download just installs Apache server and not
other unwanted code as with `XAMPP`.
2. **Install Apache**. In the `ApacheHaus` there is a `readme_first.html` that contains installation instructions. I will 
cover them very briefly here. Unzip the download to `C:\Apache24`. 
3. **Start apache** by running `C:\Apache24\bin\httpd.exe`. This displayed a 
_Windows protected your PC_ notification warning that the _Mircosoft Defender SmartScreen_ prevented
the app from running. Trigger it to _Run Anyway_. This then triggered a _Windows Defender Firewall_ 
message indicating that it had blocked some features of this app. However things seemed to still work.
4. **Test the installation** by opening `http://localhost` in a browser. You should see a test page.
5. **Setup VirtualHost**. Point web hosting to the Time Tracker app so that it will come up when you
go to `localhost`.

Add the following to the end of `C:\Apache24\conf\httpd.conf`:
```
# Setup hosting of the Time Tracker for development.
<VirtualHost *:80>
    ServerName timetracker.localhost

    DocumentRoot "C:/path to the time tracker/time-tracker"
    <Directory />
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

Note that the path needs to have slashes in the Unix direction `/` instead of `\` and if your
path has spaces in it the path must have quotes `""` around it.

If `httpd.exe` fails to start then there might be an error in the config file. To see this 
error start Apache from a commandline.


### Development while using the Time Tracker

If you are using the Time Tracker and wish to also do some development on the app then
you need to be careful not to lose your time records during development.

When developing using Apache the local store area for localhost (`http://localhost`) is different 
from when you are running the app just off the file system (`file://`) and so the Apache 
localhost version of the app should not interact with the one running off the file system.

At this stage the Time Tracker does not have an import feature to restore exported
time records and so if you need to test off the file system served version of the app
without damaging your normal Time Tracking database you can use an incognito browser 
window or use a different web browser (i.e. Firefox if you normally use Chrome for your 
time tracking).


## Compilation

The project is built using the `make` command. To run this `make` command you will need a Linux/Unix
environment. On Windows you can still do development using an Apache webserver, just not the 
build packaging process.

The build creates a standalone HTML file that can be used without a web server like Apache.

```
make clean
make
```

The standalone HTML file can be found in `target/time-tracker.html`
