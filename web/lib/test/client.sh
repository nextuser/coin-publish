
sui client switch --address develop
sui client gas
```
────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│ Showing 32 gas coins and their balances.                                                                   │
├────────────────────────────────────────────────────────────────────┬────────────────────┬──────────────────┤
│ gasCoinId                                                          │ mistBalance (MIST) │ suiBalance (SUI) │
| 0x0c2d8ab611ac964e87fcacecb148a3e03214e1ba7a771d0b5e86418c44770a65 │ 1000000000         │ 1.00             │
| 0x0d898f535899c9788ca0468376aa3dfe79ddc52e07a40e4fc8cd973d2a779311 │ 1000000000         │ 1.00             │
│ 0x0d898f535899c9788ca0468376aa3dfe79ddc52e07a40e4fc8cd973d2a779311 │ 1000000000         │ 1.00             │
│ 0x2c39969170b1e89fb8ec47cf860673cb7ec60c184afc6aaec7d7403fabcb7e0d │ 1000000000         │ 1.00             │
│ 0x31abdf3a6fb90a938e9989b769087a77f89d93f8a6c835ea4470782d17a24237 │ 1000000000         │ 1.00             │
```

sui client ptb --merge-coins @0x0c2d8ab611ac964e87fcacecb148a3e03214e1ba7a771d0b5e86418c44770a65 [@0x0d898f535899c9788ca0468376aa3dfe79ddc52e07a40e4fc8cd973d2a779311,
@0x0d898f535899c9788ca0468376aa3dfe79ddc52e07a40e4fc8cd973d2a779311,
@0x2c39969170b1e89fb8ec47cf860673cb7ec60c184afc6aaec7d7403fabcb7e0d,
@0x2c39969170b1e89fb8ec47cf860673cb7ec60c184afc6aaec7d7403fabcb7e0d]

 sui client ptb transfer-objects[0x0c2d8ab611ac964e87fcacecb148a3e03214e1ba7a771d0b5e86418c44770a65] dev

 sui client ptb --transfer-objects [@0x0c2d8ab611ac964e87fcacecb148a3e03214e1ba7a771d0b5e86418c44770a65] dev



sui client object 