# MiningBots Frontend 

This site connects to an ongoing `MiningBots` game and provices an birds-eye view of the entire map

## Deployment Notes
Deploying this site publicly requires all endpoints be secured, ie `https`/`wss`. Reverse proxy non-TLS traffic as necessary such that your browser will not block loading mixed content from `https` and `http` sources.

An example of a `Caddyfile` (this assumes this code is stored in `/opt/web/miningbots-fe`)

```Caddyfile
game.bootcamp.tk.sg {
	tls /etc/ssl/fullchain1.pem /etc/ssl/privkey1.pem # Using the same Wildcard cert obtained with certbot
	header {
		Access-Control-Allow-Origin *
		Access-Control-Allow-Credentials true
		Access-Control-Allow-Methods *
		Access-Control-Allow-Headers *
		defer
	}
	root * /opt/web/miningbots-fe
	file_server
}

p1.bootcamp.tk.sg {
	tls /etc/ssl/fullchain1.pem /etc/ssl/privkey1.pem # Using the same Wildcard cert obtained with certbot
	header {
		Access-Control-Allow-Origin *
		Access-Control-Allow-Credentials true
		Access-Control-Allow-Methods *
		Access-Control-Allow-Headers *
		defer
	}
	reverse_proxy server.bootcamp.tk.sg:9001 {
		header_down -Access-Control-Allow-Origin
	}
}
```

## ``` init.sh ```

To use ``` init.sh ```, the following software must be installed:
<table>
	<tr>
		<th>Software name</th>
	    <th>APT package name(s)</th>
		<th>YUM package name(s)</th>
	</tr>
	<tr>
		<td>GNU Bash Shell</td>
		<td>``` bash ```</td>
		<td>``` bash ```</td>
	</tr>
	<tr>
		<td>Firefox Browser</td>
		<td>``` firefox ```</td>
		<td>``` firefox ```</td>
	</tr>
	<tr>
		<td>Python 3</td>
		<td>``` python3 ```</td>
		<td>``` python3 ```</td>
	</tr>
</table>

### Windows version

A Windows version is available, called ``` init.win.sh ```
<br><br>
To be able to use this version, the following software must be installed:
<ul>
  <li>
		  Git Bash
		</li>
		<li>
		  Firefox Browser
		</li>
</ul>