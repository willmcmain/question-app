"use strict";
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

function shuffle(array) {
    var array = array.slice();
    for (var i = array.length - 1; i > 0; i--) {
        var j = (i * 193877) % i;
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


function Answer(props) {
    var click = (() => props.handler(props.correct));
    return (<button
        type='button'
        disabled={props.disabled}
        onClick={click}>
        {props.answer}
    </button>)
}


function Question(props) {
    var answers = shuffle(
        [props.question.answer].concat(props.question.distractors));
    return (<div>
            <div>{props.question.question}</div>
            <ul>
                {answers.map((ans, i) =>
                    <li key={i}>
                        <Answer answer={ans}
                          correct={ans===props.question.answer}
                          handler={props.handler}
                          disabled={props.answered} />
                    </li>)}
            </ul>
            </div>)
}

function RightOrWrong(props) {
    return <div>{props.correct?"Correct!":"Wrong!"}</div>
}

export default class QuestionGame extends React.Component {
    constructor() {
        super();
        this.state = {
            score: 0,
            total: 0,
            question: {},
            answered: false,
            rwdisplay: null,
        };
    }

    componentDidMount() {
        this.next();
    }

    answer(correct) {
        const score = this.state.score + (correct?1:0);
        this.setState({
            score: score,
            answered: true,
            rwdisplay: <RightOrWrong correct={correct} />,
        });
    }

    next() {
        const that = this;
        const total = this.state.total + 1;

        $.ajax({
            url: "/questions/random/"
        })
        .done(function(data) {
            that.setState({
                question: data,
                total: total,
                answered: false,
                rwdisplay: null,
            });
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            alert('ajax request failed:' + textStatus);
        });
    }

    render() {
        return (
            <div>
                <Question question={this.state.question}
                    answered={this.state.answered}
                    handler={(correct) => this.answer(correct)}/>
                <button type='button'
                    disabled={!this.state.answered}
                    onClick={() => this.next()}>Next</button>
                {this.state.rwdisplay}
                <div>Score:
                  {this.state.score} correct out of {this.state.total}
                </div>
            </div>
        )
    }
}
