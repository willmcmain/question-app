"use strict";
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Button, ButtonToolbar} from 'react-bootstrap';

function shuffle(array) {
    var array = array.slice();
    for (var i = array.length - 1; i > 0; i--) {
        var j = (i + 193877) % i;
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


function Answer(props) {
    var click = (() => props.handler(props.correct));
    var style = (props.answered ?
              (props.correct ? "success" : "danger")
              : "default");
    return (<Button
        bsSize='large'
        bsStyle={style}
        style={{'margin-right': "10px"}}
        type='button'
        disabled={props.answered}
        onClick={click}>
        {props.answer}
    </Button>)
}


function Question(props) {
    var answers = shuffle(
        [props.question.answer].concat(props.question.distractors));
    return (
      <div>
        <h1>{props.question.question}</h1>
        <p>
          {answers.map((ans, i) =>
            <Answer
              key={i}
              answer={ans}
              correct={ans===props.question.answer}
              handler={props.handler}
              answered={props.answered} />
          )}
        </p>
      </div>)
}

function RightOrWrong(props) {
    var style = {
        'font-size': '32px',
        color: props.correct?'green':'red',
    }
    return (
      <div style={style}>
        {props.correct?"Correct!":"Wrong!"}
      </div>)
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
            <div style={{textAlign: 'center'}}>
                <Question question={this.state.question}
                    answered={this.state.answered}
                    handler={(correct) => this.answer(correct)}/>
                {this.state.rwdisplay}
                <Button
                    bsSize='large'
                    type='button'
                    disabled={!this.state.answered}
                    onClick={() => this.next()}>Next</Button>
                <div style={{"font-size": 24}}>
                   Score: {this.state.score} correct out of {this.state.total}
                </div>
            </div>
        )
    }
}
