export PATH=/usr/bin

export GPG_AGENT_SOCK="$APPDATA\\gnupg\\S.gpg-agent.extra"
export LISTEN_PORT=$((31000 + $$ % 1000))

node /gpg-agent-relay/app.js &
pid_a=$!

/usr/bin/putty -R 31000:localhost:$LISTEN_PORT

kill $pid_a

