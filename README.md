# Time tracker

This project was build to keep track of my time at work.

## Installation

Copy the file `target/time-tracker.html` on your computer and load it on a web browser.

**NOTE:** If you want to avoid problems, do NOT use **Internet Explorer** or **Edge**.

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

## Compilation

The project is build using the make command.

The build create a standalone HTML file that can be used without a web server like Apache.

```
make clean
make
```

The standalone HTML file can be found in `target/time-tracker.html`
