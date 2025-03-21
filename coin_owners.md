
https://docs.blockvision.org/reference/retrieve-coin-holders

- http request
```bash
curl --request GET \
     --url 'https://api.blockvision.org/v2/sui/coin/holders?coinType=0x0000000000000000000000000000000000000000000000000000000000000002%3A%3Asui%3A%3ASUI&pageIndex=1&pageSize=20' \
     --header 'accept: application/json' \
     --header 'x-api-key: 2uCHp4CVEopGpDP4Xp9lgz9mLIv'
```
- response
``` json
{
  "code": 200,
  "message": "OK",
  "result": {
    "data": [
      {
        "account": "0xac5bceec1b789ff840d7d4e6ce4ce61c90d190a7f8c4f4ddf0bff6ee2413c33c",
        "balance": "274264118.222965",
        "percentage": "0.086523"
      },
      {
        "account": "0x443cf42b0da43c230bff7a64e69ce25d24d65f49e7c9db6adecc0bd176dba79a",
        "balance": "74090101.417531",
        "percentage": "0.023373"
      },
      {
        "account": "0x15610fa7ee546b96cb580be4060fae1c4bb15eca87f9a0aa931512bad445fc76",
        "balance": "71851402.233585",
        "percentage": "0.022667"
      },
      {
        "account": "0xab73ad38c63f83eda02182422b545395be1d3caeb54b5869159a9f70b678cd56",
        "balance": "41637356.745953",
        "percentage": "0.013135"
      },
      {
        "account": "0x60dd01bc037e2c1ea2aaf02187701f9f4453ba323338d2f2f521957065b0984d",
        "balance": "39154596.342176",
        "percentage": "0.012352"
      },
      {
        "account": "0x7ab9a6a7109dcb9cb357a109f32dfcc78a7aa2d6029084eb924d95133fc71cec",
        "balance": "30278868.213831",
        "percentage": "0.009552"
      },
      {
        "account": "0x935029ca5219502a47ac9b69f556ccf6e2198b5e7815cf50f68846f723739cbd",
        "balance": "27173456.037092",
        "percentage": "0.008572"
      },
      {
        "account": "0x1ef96cda62b3a3fe3cb3f7cf7563fcc4ab44e018488d1d8ef2031a67a6c8d7eb",
        "balance": "23754160.192102",
        "percentage": "0.007494"
      },
      {
        "account": "0x5fdfcc18e0791862c107c49ea13a5bcf4965f00ac057f56ea04034ebb5ea45ad",
        "balance": "22721131.991121",
        "percentage": "0.007168"
      },
      {
        "account": "0xb4f42571101827758f55a9b998a1251892402fbd4dce90da3373625298091627",
        "balance": "22425028.029778",
        "percentage": "0.007074"
      },
      {
        "account": "0x6605abfdbfbf98c09c7bc072abb0781103231a2a8dff28c33a5faaed5aaf081e",
        "balance": "17316546.431378",
        "percentage": "0.005463"
      },
      {
        "account": "0xac989493a6c203244705bcb62123b96df4e5d79cf29fa9b1277dc0f1751a7539",
        "balance": "16460769.000000",
        "percentage": "0.005193"
      },
      {
        "account": "0x5696a56cf5fad84cb2f9f240ab00b889b85726b8e310edde055b3e380e394acf",
        "balance": "13648438.927238",
        "percentage": "0.004306"
      },
      {
        "account": "0x2415e4b60b7b6a853f3b430d0dae82bc7d11db17ff213abdeff13243498d365f",
        "balance": "12204769.820784",
        "percentage": "0.003850"
      },
      {
        "account": "0x14f6dcefbbc67d4291c7cafe37e33f5391bf2f9c4519fe037bbb0a1e2dd5e2b6",
        "balance": "10216177.074324",
        "percentage": "0.003223"
      },
      {
        "account": "0x31472256fd9c48f9acacb7957b75c317cd97ac1973d71c9101bdcf365b17b550",
        "balance": "9859817.702037",
        "percentage": "0.003111"
      },
      {
        "account": "0x0adf93e6ca912002ffc75d3bc4c850e13885cc3ef5491bd923c625d04fabf00d",
        "balance": "9756015.857979",
        "percentage": "0.003078"
      },
      {
        "account": "0xb18af8bf1b54e5b283ed5a35eb105699fe4d25c1f69c9de1dc8a832676b412bc",
        "balance": "9669993.987410",
        "percentage": "0.003051"
      },
      {
        "account": "0x3da2cb67c887c9a03d1052d486733a77105824f7413fc3cbbe3641d4b67af102",
        "balance": "8898515.018739",
        "percentage": "0.002807"
      },
      {
        "account": "0x2190fd6ffed87ab80b346ca1c1a39257fa843ab19a529dbd15db4e8d000e8936",
        "balance": "8853396.980000",
        "percentage": "0.002793"
      }
    ],
    "nextPageIndex": 2,
    "total": 22206663
  }
}
```
