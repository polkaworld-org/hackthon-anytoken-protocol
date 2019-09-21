import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import keyring from '@polkadot/ui-keyring';
import React, { useState, useEffect } from 'react';
import { Container, Dimmer, Loader} from 'semantic-ui-react';

import Balances from './Balances';
import NodeInfo from './NodeInfo';
import Transfer from './Transfer';
import 'semantic-ui-css/semantic.min.css'

 export default function App () {
  const [api, setApi] = useState();
  const [apiReady, setApiReady] = useState();
  const [accountLoaded, setaccountLoaded] = useState(false);
  const WS_PROVIDER = 'ws://127.0.0.1:9944';
  // const WS_PROVIDER = 'wss://dev-node.substrate.dev:9944';

  useEffect(() => {
    const provider = new WsProvider(WS_PROVIDER);

    ApiPromise.create({provider})
      .then((api) => {
        setApi(api);
        api.isReady.then(() => setApiReady(true));
      })
      .catch((e) => console.error(e));
  }, []);

  // new hook to get injected accounts
  useEffect(() => {
    web3Enable('substrate-front-end-tutorial')
    .then((extensions) => {
    // web3Accounts promise returns an array of accounts
    // or an empty array if our user doesn't have an extension or hasn't given the
    // access to any of their account.
    web3Accounts()
        .then((accounts) => {
          // add the source to the name to avoid confusion
          return accounts.map(({ address, meta }) => ({
              address,
              meta: {
              ...meta,
              name: `${meta.name} (${meta.source})`
              }
          }));
        })
        // load our keyring with the newly injected accounts
        .then((injectedAccounts) => {
          loadAccounts(injectedAccounts);
        })
        .catch(console.error);
    })
    .catch(console.error);
  }, []);

  const loadAccounts = (injectedAccounts) => {
    keyring.loadAll({
      isDevelopment: true
    }, injectedAccounts);
    setaccountLoaded(true);
  };

  const loader = function (text){
    return (
      <Dimmer active>
        <Loader size='small'>{text}</Loader>
      </Dimmer>
    );
  };

  if(!apiReady){
    return loader('Connecting to the blockchain')
  }

  if (!accountLoaded) {
    return loader('Loading accounts (please review any extension\'s authorization)');
  }

  return (
    <Container>
      <NodeInfo
        api={api}
      />
      <Balances
        keyring={keyring}
        api={api}
      />
      <Transfer
        api={api}
        keyring={keyring}
      />
    </Container>
  );
}
