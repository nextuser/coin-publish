export COIN_TYPE=`cat pub.out |grep type_name |awk -F "'" '{ print $2}' `
export VAULT=`  cat pub.out |grep vault_address |awk -F "'" '{ print $2}' `
export COIN_MANAGER_PACKAGE=` cat pub.out |grep event_type |awk -F "'" '{ print $2}' | awk -F ':' '{print $1}' `
