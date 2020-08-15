# Local

Click `run.bat` and login

# Remote

```bash
$ socat UNIX-LISTEN:/home/your/.gpgnu/S.gpg-agent,unlink-close,unlink-early TCP4:localhost:31000
```

