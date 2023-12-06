npm run build
pm2 kill
date_deploy=`date +"%Y%m%d"`
pm2 start dist/main.js --name "open_beta_${date_deploy}"
pm2 save