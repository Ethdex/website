import * as _ from 'lodash';
import * as React from 'react';
import * as DocumentTitle from 'react-document-title';
import RaisedButton from 'material-ui/RaisedButton';
import {colors} from 'material-ui/styles';
import {Styles, FAQSection, FAQQuestion} from 'ts/types';
import {Link} from 'react-router-dom';
import {TopBar} from 'ts/components/top_bar';
import {Question} from 'ts/pages/faq/question';
import {configs} from 'ts/utils/configs';

export interface FAQProps {
    source: string;
    location: Location;
}

interface FAQState {}

const styles: Styles = {
    thin: {
        fontWeight: 100,
    },
};

const sections: FAQSection[] = [
    {
        name: '',
        questions: [
            {
                prompt: 'What is Ethdex?',
                answer: (
                    <div>
                        Ethdex is follows the same design as 0x. We have modified the contracts and OTC to 
                        use Ether as fees rather than allocate and hold an ICO for a utility token.
                        It can be used as a trustless ERC20 token exchange between two parties.
                    </div>
                ),
            },
            {
                prompt: 'How is Ethdex different from 0x',
                answer: (
                    <div>
                      We have removed all specialised token fees and replaced them with Ether. All relayer fees
                      sent to the fee recipient will be paid in Ether from the maker and taker.
                    </div>
                ),
            },
            {
                prompt: 'If Ethdex is free to use, where do transaction fees come in?',
                answer: (
                    <div>
                        Ethdex relies on off-chain order books to massively reduce friction costs for
                        market makers and ensure that the blockchain is only used for trade settlement.
                        Hosting and maintaining an off-chain order book is a service; to incent “Relayers”
                        to provide this service they must be able to charge transaction fees on trading
                        activity. Relayers are free to set their transaction fees to any value they desire.
                        We expect Relayers to be highly competitive and transaction fees to approach an
                        efficient economic equilibrium over time.
                    </div>
                ),
            },
            {
                prompt: 'What types of digital assets are supported by Ethdex?',
                answer: (
                    <div>
                        Ethdex supports all Ethereum-based assets that adhere to the ERC20 token standard.
                        There are many ERC20 tokens, worth a combined $2.2B, and more tokens are created
                        each month. We believe that, by 2020, thousands of assets will be tokenized and
                        moved onto the Ethereum blockchain including traditional securities such as equities,
                        bonds and derivatives, fiat currencies and scarce digital goods such as video game
                        items.
                    </div>
                ),
            },
            {
                prompt: 'Ethdex/0x is open source: what prevents someone from forking the protocol?',
                answer: (
                    <div>
                        Ethdex is a modified fork of 0x, replacing 0x tokens for fees with Ether.
                    </div>
                ),
            },
        ],
    },
];

export class FAQ extends React.Component<FAQProps, FAQState> {
    public componentDidMount() {
        window.scrollTo(0, 0);
    }
    public render() {
        return (
            <div>
                <DocumentTitle title="Frequently Asked Questions"/>
                <div
                    id="faq"
                    className="mx-auto max-width-4 pt4"
                >
                    <h1 className="center" style={{...styles.thin}}>Frequently Asked Questions</h1>
                    <div className="sm-px2 md-px2 lg-px0 pb4">
                        {this.renderSections()}
                    </div>
                </div>
            </div>
        );
    }
    private renderSections() {
        const renderedSections = _.map(sections, (section: FAQSection, i: number) => {
            const isFirstSection = i === 0;
            return (
                <div key={section.name}>
                    <h3>{section.name}</h3>
                    {this.renderQuestions(section.questions, isFirstSection)}
                </div>
            );
        });
        return renderedSections;
    }
    private renderQuestions(questions: FAQQuestion[], isFirstSection: boolean) {
        const renderedQuestions = _.map(questions, (question: FAQQuestion, i: number) => {
            const isFirstQuestion = i === 0;
            return (
                <Question
                    key={question.prompt}
                    prompt={question.prompt}
                    answer={question.answer}
                    shouldDisplayExpanded={isFirstSection && isFirstQuestion}
                />
            );
        });
        return renderedQuestions;
    }
}
