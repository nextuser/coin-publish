import { number } from "echarts";

const BV_URL = 'https://api.blockvision.org/v2/sui/coin/holders';

export type AccountBalance = {
    account : string,
    balance : string,
    percentage : string,
}

export type Response = {
    code : string,
    message : string,
    result: {
        data : AccountBalance[],
        nextPageIndex: number,
        total : number,
    }
}

function buildQueryString(params: Record<string, string | number | boolean>): string {
    const queryParams: string[] = [];
    for (const key in params) {
        if (params.hasOwnProperty(key)) {
            const value = encodeURIComponent(params[key].toString());
            const encodedKey = encodeURIComponent(key);
            queryParams.push(`${encodedKey}=${value}`);
        }
    }
    return queryParams.join('&');
}

function buildGetUrl(baseUrl: string, params: Record<string, string | number | boolean>): string {
    const queryString = buildQueryString(params);
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

export async function fetch_coin_owners(coin_type : string) : Promise<Response | null>{
    let api_key = process.env.BV_API_KEY || '';
    if(api_key.length == 0 || coin_type.length == 0){
        console.log("export BV_API_KEY=... and COIN_TYPE first");
        process.exit(-1);
    }

    // 使用示例
    const baseUrl = BV_URL;''
    const params = {
        coinType: coin_type,
        pageIndex: 1,
        PageSize: 20
    }

    const url = buildGetUrl(baseUrl,params);
    //'?coinType=0x0000000000000000000000000000000000000000000000000000000000000002%3A%3Asui%3A%3ASUI&pageIndex=1&pageSize=20';
    const options = {
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'x-api-key': api_key
        }
    };

    console.log("url=",url);

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        ///console.log("response:",response);
        
        const text = await response.text();
        let data  = JSON.parse(text);
        let rsp = data as Response;
        console.log("account, balance, percentage");
        if(rsp.code == "200"  && rsp.result.data.length > 0 ){
            return rsp;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
    return null;
}


//'https://api.blockvision.org/v2/sui/coin/holders?coinType=0x0000000000000000000000000000000000000000000000000000000000000002%3A%3Asui%3A%3ASUI&pageIndex=1&PageSize=20'
//'https://api.blockvision.org/v2/sui/coin/holders?coinType=0x0000000000000000000000000000000000000000000000000000000000000002%3A%3Asui%3A%3ASUI&pageIndex=1&pageSize=20'