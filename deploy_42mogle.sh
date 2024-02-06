# Build Nest.js application
npm run build

# Deploy Nest.js application using pm2
date_deploy=`date +"%Y%m%d"`
pm2 delete `pm2 ls | awk '/open_beta/ {print $4}'`
pm2 start ./dist/main.js --name "open_beta_${date_deploy}"
pm2 save