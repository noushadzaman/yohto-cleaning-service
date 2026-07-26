#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
cd /home/zaman/yohto-cleaning-service/client

export API_BASE_URL="${API_BASE_URL:-http://127.0.0.1:5000}"

npm run start:prod
