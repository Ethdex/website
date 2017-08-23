import * as _ from 'lodash';
import * as React from 'react';
import {connect} from 'react-redux';
import {Store as ReduxStore, Dispatch} from 'redux';
import {State} from 'ts/redux/reducer';
import {constants} from 'ts/utils/constants';
import {Dispatcher} from 'ts/redux/dispatcher';
import {Side, HashData, TokenByAddress, BlockchainErrs, Fill, Order, ScreenWidths} from 'ts/types';
import {
    OTC as OTCComponent,
    OTCAllProps as OTCComponentAllProps,
    OTCPassedProps as OTCComponentPassedProps,
} from 'ts/components/otc';
import * as BigNumber from 'bignumber.js';

interface MapStateToProps {
    blockchainErr: BlockchainErrs;
    blockchainIsLoaded: boolean;
    hashData: HashData;
    networkId: number;
    nodeVersion: string;
    orderFillAmount: number;
    tokenByAddress: TokenByAddress;
    userEtherBalance: number;
    screenWidth: ScreenWidths;
    shouldBlockchainErrDialogBeOpen: boolean;
    userAddress: string;
    userSuppliedOrderCache: Order;
}

interface ConnectedState {}

interface ConnectedDispatch {
    dispatcher: Dispatcher;
}

const mapStateToProps = (state: State, ownProps: OTCComponentAllProps): ConnectedState => {
    const receiveAssetToken = state.sideToAssetToken[Side.receive];
    const depositAssetToken = state.sideToAssetToken[Side.deposit];
    const receiveAddress = !_.isUndefined(receiveAssetToken.address) ?
                          receiveAssetToken.address : constants.NULL_ADDRESS;
    const depositAddress = !_.isUndefined(depositAssetToken.address) ?
                          depositAssetToken.address : constants.NULL_ADDRESS;
    const receiveAmount = !_.isUndefined(receiveAssetToken.amount) ?
                          receiveAssetToken.amount : new BigNumber(0);
    const depositAmount = !_.isUndefined(depositAssetToken.amount) ?
                          depositAssetToken.amount : new BigNumber(0);
    const hashData = {
        depositAmount,
        depositTokenContractAddr: depositAddress,
        feeRecipientAddress: constants.FEE_RECIPIENT_ADDRESS,
        makerFee: constants.MAKER_FEE,
        orderExpiryTimestamp: state.orderExpiryTimestamp,
        orderMakerAddress: state.userAddress,
        orderTakerAddress: state.orderTakerAddress !== '' ? state.orderTakerAddress : constants.NULL_ADDRESS,
        receiveAmount,
        receiveTokenContractAddr: receiveAddress,
        takerFee: constants.TAKER_FEE,
        orderSalt: state.orderSalt,
    };
    return {
        blockchainErr: state.blockchainErr,
        blockchainIsLoaded: state.blockchainIsLoaded,
        networkId: state.networkId,
        nodeVersion: state.nodeVersion,
        orderFillAmount: state.orderFillAmount,
        hashData,
        screenWidth: state.screenWidth,
        shouldBlockchainErrDialogBeOpen: state.shouldBlockchainErrDialogBeOpen,
        tokenByAddress: state.tokenByAddress,
        userAddress: state.userAddress,
        userEtherBalance: state.userEtherBalance,
        userSuppliedOrderCache: state.userSuppliedOrderCache,
        flashMessage: state.flashMessage,
    };
};

const mapDispatchToProps = (dispatch: Dispatch<State>): ConnectedDispatch => ({
    dispatcher: new Dispatcher(dispatch),
});

export const OTC: React.ComponentClass<OTCComponentPassedProps> =
  connect(mapStateToProps, mapDispatchToProps)(OTCComponent);
