"use strict";
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

export default class QuestionAdmin extends React.Component {
    constructor() {
        super();
        this.state = {
            questions: [],
        }
    }

    componentDidMount() {
        var that = this;

        $.ajax({
            url: "/questions/?results_per_page=25"
        })
        .done(function(data) {
            that.setState({
                questions: data,
            });
        })
    }

    render() {
        return (
            <table className='table table-striped table-hover'>
              <thead>
                <tr>
                  <th></th>
                  <th>Question</th>
                  <th>Answer</th>
                  <th>Distractors</th>
                </tr>
              </thead>
              <tbody>
                {this.state.questions.map(
                    (q, i) => <QuestionEntry question={q} />)}
              </tbody>
            </table>
        );
    }
}

function QuestionEntry(props) {
    return (
        <tr key={props.question.qid}>
            <td>
              <span className='glyphicon glyphicon-pencil'></span>
              <span className='glyphicon glyphicon-trash'></span>
            </td>
            <td>{props.question.question}</td>
            <td>{props.question.answer}</td>
            <td></td>
        </tr>
    );
}
