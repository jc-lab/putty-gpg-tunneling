LOCAL_SOCK="$APPDATA\\gnupg\\S.gpg-agent.extra"

TEMP_PORT=$((31000 + $$ % 1000))

./socat TCP-LISTEN:$TEMP_PORT,bind=127.0.0.1 "UNIX-CONNECT:$LOCAL_SOCK" &
pid_a=$!

./putty -R 31000:localhost:$TEMP_PORT

kill $pid_a

