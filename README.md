# Local

Click `run.bat` and login

# Remote

```bash
$ socat UNIX-LISTEN:/home/your/.gpgnu/S.gpg-agent,unlink-close,unlink-early TCP4:localhost:31000
```

Smart script:

```bash
FORWARDED_SOCK=/home/$USER/S.gpg-agent
socat UNIX-LISTEN:$FORWARDED_SOCK,fork,unlink-close,unlink-early TCP4:localhost:31000 &
SOCAT_PID=$!

function cleanup() {
        if [ -n "$SOCAT_PID" ]; then
                echo "KILL SOCAT"
                kill $SOCAT_PID
        fi
}

trap cleanup EXIT

# Somethings
# Use
# GPG

# Docker Example

docker run --rm \
        -v $FORWARDED_SOCK:/root/.gnupg/S.gpg-agent \
        -it YOUR_IMAGE YOUR_SCRIPT


```

