import * as _ from 'lodash';
import * as React from 'react';
import {connect} from 'react-redux';
import {Store as ReduxStore, Dispatch} from 'redux';
import {Dispatcher} from 'ts/redux/dispatcher';
import {State} from 'ts/redux/reducer';
import {Blockchain} from 'ts/blockchain';
import {GenerateOrderForm as GenerateOrderFormComponent} from 'ts/components/generate_order/generate_order_form';
import {
    SideToAssetToken,
    SignatureData,
    HashData,
    TokenByAddress,
    BlockchainErrs,
} from 'ts/types';
import * as BigNumber from 'bignumber.js';

interface GenerateOrderFormProps {
    blockchain: Blockchain;
    hashData: HashData;
    dispatcher: Dispatcher;
}

interface ConnectedState {
    blockchainErr: BlockchainErrs;
    blockchainIsLoaded: boolean;
    orderExpiryTimestamp: BigNumber.BigNumber;
    orderSignatureData: SignatureData;
    userAddress: string;
    orderTakerAddress: string;
    orderSalt: BigNumber.BigNumber;
    networkId: number;
    sideToAssetToken: SideToAssetToken;
    tokenByAddress: TokenByAddress;
}

const mapStateToProps = (state: State, ownProps: GenerateOrderFormProps): ConnectedState => ({
    blockchainErr: state.blockchainErr,
    blockchainIsLoaded: state.blockchainIsLoaded,
    orderExpiryTimestamp: state.orderExpiryTimestamp,
    orderSignatureData: state.orderSignatureData,
    orderTakerAddress: state.orderTakerAddress,
    orderSalt: state.orderSalt,
    networkId: state.networkId,
    sideToAssetToken: state.sideToAssetToken,
    tokenByAddress: state.tokenByAddress,
    userAddress: state.userAddress,
});

export const GenerateOrderForm: React.ComponentClass<GenerateOrderFormProps> =
  connect(mapStateToProps)(GenerateOrderFormComponent);
