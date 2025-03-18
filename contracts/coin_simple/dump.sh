rm -f Move.lock
sui move build --dump-bytecode-as-base64  >out.json

cp out.json ../../web/lib/

