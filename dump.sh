rm -f Move.lock
sui move build --dump-bytecode-as-base64  >coin_bytecode.json

cp coin_bytecode.json ../../web/lib/

