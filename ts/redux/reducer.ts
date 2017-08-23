import * as _ from 'lodash';
import {ZeroEx} from '0x.js';
import * as BigNumber from 'bignumber.js';
import {utils} from 'ts/utils/utils';
import {
    GenerateOrderSteps,
    Side,
    SideToAssetToken,
    Direction,
    BlockchainErrs,
    SignatureData,
    TokenByAddress,
    Order,
    Action,
    ActionTypes,
    ScreenWidths,
    ProviderType,
} from 'ts/types';

// Instead of defaulting the 0x.js version to an empty string, we pre-populate it with
// a valid version value. This does not need to be updated however, since onLoad, it
// is always replaced with a value retrieved from our S3 bucket.
const DEFAULT_0X_JS_VERSION = '0.7.1';

export interface State {
    // OTC
    blockchainErr: BlockchainErrs;
    blockchainIsLoaded: boolean;
    generateOrderStep: GenerateOrderSteps;
    networkId: number;
    orderExpiryTimestamp: BigNumber.BigNumber;
    orderFillAmount: BigNumber.BigNumber;
    orderTakerAddress: string;
    orderSignatureData: SignatureData;
    orderSalt: BigNumber.BigNumber;
    nodeVersion: string;
    screenWidth: ScreenWidths;
    shouldBlockchainErrDialogBeOpen: boolean;
    sideToAssetToken: SideToAssetToken;
    tokenByAddress: TokenByAddress;
    userAddress: string;
    userEtherBalance: BigNumber.BigNumber;
    // Note: cache of supplied orderJSON in fill order step. Do not use for anything else.
    userSuppliedOrderCache: Order;

    // Docs
    zeroExJSversion: string;
    availableZeroExJSVersions: string[];

    // Shared
    flashMessage: string|React.ReactNode;
    providerType: ProviderType;
    injectedProviderName: string;
};

const INITIAL_STATE: State = {
    // OTC
    blockchainErr: '',
    blockchainIsLoaded: false,
    generateOrderStep: GenerateOrderSteps.ChooseAssets,
    networkId: undefined,
    orderExpiryTimestamp: utils.initialOrderExpiryUnixTimestampSec(),
    orderFillAmount: undefined,
    orderSignatureData: {
        hash: '',
        r: '',
        s: '',
        v: 27,
    },
    orderTakerAddress: '',
    orderSalt: ZeroEx.generatePseudoRandomSalt(),
    nodeVersion: undefined,
    screenWidth: utils.getScreenWidth(),
    shouldBlockchainErrDialogBeOpen: false,
    sideToAssetToken: {
        [Side.deposit]: {},
        [Side.receive]: {},
    },
    tokenByAddress: {},
    userAddress: '',
    userEtherBalance: new BigNumber(0),
    userSuppliedOrderCache: undefined,

    // Docs
    zeroExJSversion: DEFAULT_0X_JS_VERSION,
    availableZeroExJSVersions: [DEFAULT_0X_JS_VERSION],

    // Shared
    flashMessage: undefined,
    providerType: ProviderType.INJECTED,
    injectedProviderName: '',
};

export function reducer(state: State = INITIAL_STATE, action: Action) {
    switch (action.type) {
        // OTC
        case ActionTypes.RESET_STATE:
            return INITIAL_STATE;

        case ActionTypes.UPDATE_ORDER_SALT: {
            return _.assign({}, state, {
                orderSalt: action.data,
            });
        }

        case ActionTypes.UPDATE_NODE_VERSION: {
            return _.assign({}, state, {
                nodeVersion: action.data,
            });
        }

        case ActionTypes.UPDATE_ORDER_FILL_AMOUNT: {
            return _.assign({}, state, {
                orderFillAmount: action.data,
            });
        }

        case ActionTypes.UPDATE_SHOULD_BLOCKCHAIN_ERR_DIALOG_BE_OPEN: {
            return _.assign({}, state, {
                shouldBlockchainErrDialogBeOpen: action.data,
            });
        }

        case ActionTypes.UPDATE_USER_ETHER_BALANCE: {
            return _.assign({}, state, {
                userEtherBalance: action.data,
            });
        }

        case ActionTypes.UPDATE_USER_SUPPLIED_ORDER_CACHE: {
            return _.assign({}, state, {
                userSuppliedOrderCache: action.data,
            });
        }

        case ActionTypes.CLEAR_TOKEN_BY_ADDRESS: {
            return _.assign({}, state, {
                tokenByAddress: {},
            });
        }

        case ActionTypes.ADD_TOKEN_TO_TOKEN_BY_ADDRESS: {
            const newTokenByAddress = state.tokenByAddress;
            newTokenByAddress[action.data.address] = action.data;
            return _.assign({}, state, {
                tokenByAddress: newTokenByAddress,
            });
        }

        case ActionTypes.UPDATE_TOKEN_BY_ADDRESS: {
            const tokenByAddress = state.tokenByAddress;
            const tokens = action.data;
            _.each(tokens, token => {
                const updatedToken = _.assign({}, tokenByAddress[token.address], token);
                tokenByAddress[token.address] = updatedToken;
            });
            return _.assign({}, state, {
                tokenByAddress,
            });
        }

        case ActionTypes.REPLACE_TOKEN_ALLOWANCE_BY_ADDRESS: {
            const tokenByAddress = state.tokenByAddress;
            const allowance = action.data.allowance;
            const tokenAddress = action.data.address;
            tokenByAddress[tokenAddress] = _.assign({}, tokenByAddress[tokenAddress], {
                allowance,
            });
            return _.assign({}, state, {
                tokenByAddress,
            });
        }

        case ActionTypes.UPDATE_TOKEN_BALANCE_BY_ADDRESS: {
            const tokenByAddress = state.tokenByAddress;
            const balanceDelta = action.data.balanceDelta;
            const tokenAddress = action.data.address;
            const currBalance = tokenByAddress[tokenAddress].balance;
            tokenByAddress[tokenAddress] = _.assign({}, tokenByAddress[tokenAddress], {
                balance: currBalance.plus(balanceDelta),
            });
            return _.assign({}, state, {
                tokenByAddress,
            });
        }

        case ActionTypes.UPDATE_ORDER_SIGNATURE_DATA: {
            return _.assign({}, state, {
                orderSignatureData: action.data,
            });
        }

        case ActionTypes.UPDATE_SCREEN_WIDTH: {
            return _.assign({}, state, {
                screenWidth: action.data,
            });
        }

        case ActionTypes.UPDATE_BLOCKCHAIN_IS_LOADED: {
            return _.assign({}, state, {
                blockchainIsLoaded: action.data,
            });
        }

        case ActionTypes.BLOCKCHAIN_ERR_ENCOUNTERED: {
            return _.assign({}, state, {
                blockchainErr: action.data,
            });
        }

        case ActionTypes.UPDATE_NETWORK_ID: {
            return _.assign({}, state, {
                networkId: action.data,
            });
        }

        case ActionTypes.UPDATE_GENERATE_ORDER_STEP: {
            const direction = action.data;
            let nextGenerateOrderStep = state.generateOrderStep;
            if (direction === Direction.forward) {
                nextGenerateOrderStep += 1;
            } else if (state.generateOrderStep !== 0) {
                nextGenerateOrderStep -= 1;
            }
            return _.assign({}, state, {
                generateOrderStep: nextGenerateOrderStep,
            });
        }

        case ActionTypes.UPDATE_CHOSEN_ASSET_TOKEN: {
            const newSideToAssetToken = _.assign({}, state.sideToAssetToken, {
                [action.data.side]: action.data.token,
            });
            return _.assign({}, state, {
                sideToAssetToken: newSideToAssetToken,
            });
        }

        case ActionTypes.UPDATE_CHOSEN_ASSET_TOKEN_ADDRESS: {
            const newAssetToken = state.sideToAssetToken[action.data.side];
            newAssetToken.address = action.data.address;
            const newSideToAssetToken = _.assign({}, state.sideToAssetToken, {
                [action.data.side]: newAssetToken,
            });
            return _.assign({}, state, {
                sideToAssetToken: newSideToAssetToken,
            });
        }

        case ActionTypes.SWAP_ASSET_TOKENS: {
            const newSideToAssetToken = _.assign({}, state.sideToAssetToken, {
                [Side.deposit]: state.sideToAssetToken[Side.receive],
                [Side.receive]: state.sideToAssetToken[Side.deposit],
            });
            return _.assign({}, state, {
                sideToAssetToken: newSideToAssetToken,
            });
        }

        case ActionTypes.UPDATE_ORDER_EXPIRY: {
            return _.assign({}, state, {
                orderExpiryTimestamp: action.data,
            });
        }

        case ActionTypes.UPDATE_ORDER_TAKER_ADDRESS: {
            return _.assign({}, state, {
                orderTakerAddress: action.data,
            });
        }

        case ActionTypes.UPDATE_USER_ADDRESS: {
            return _.assign({}, state, {
                userAddress: action.data,
            });
        }

        // Docs
        case ActionTypes.UPDATE_LIBRARY_VERSION: {
            return _.assign({}, state, {
                zeroExJSversion: action.data,
            });
        }
        case ActionTypes.UPDATE_AVAILABLE_LIBRARY_VERSIONS: {
            return _.assign({}, state, {
                availableZeroExJSVersions: action.data,
            });
        }

        // Shared
        case ActionTypes.SHOW_FLASH_MESSAGE: {
            return _.assign({}, state, {
                flashMessage: action.data,
            });
        }

        case ActionTypes.HIDE_FLASH_MESSAGE: {
            return _.assign({}, state, {
                flashMessage: undefined,
            });
        }

        case ActionTypes.UPDATE_PROVIDER_TYPE: {
            return _.assign({}, state, {
                providerType: action.data,
            });
        }

        case ActionTypes.UPDATE_INJECTED_PROVIDER_NAME: {
            return _.assign({}, state, {
                injectedProviderName: action.data,
            });
        }

        default:
            return state;
    }
}
