"use strict";
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Modal, Button} from 'react-bootstrap';

export default class QuestionAdmin extends React.Component {
    constructor() {
        super();
        this.state = {
            questions: [],
        }
    }

    componentDidMount() {
        this.load_questions();
    }

    load_questions() {
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

    delete_question(qid) {
        var that = this;
        $.ajax({
            url: '/questions/' + qid + '/',
            method: 'DELETE'
        })
        .done(function(data) {
            that.load_questions();
        });
    }

    update_question(qid) {
        alert("Update " + qid);
        this.forceUpdate();
    }

    render() {
        return (
            <table className='table table-hover'>
              <thead>
                <tr>
                  <th></th>
                  <th>Question</th>
                  <th>Answer</th>
                  <th>Wrong Answers</th>
                </tr>
              </thead>
              <tbody>
                {this.state.questions.map((q, i) =>
                  <QuestionEntry
                    key={q.qid}
                    question={q}
                    onupdate={(qid) => this.update_question(qid)}
                    ondelete={(qid) => this.delete_question(qid)} />
                )}
              </tbody>
            </table>
        );
    }
}


function QuestionEntry(props) {
    return (
        <tr>
          <td>
            <DeleteBox question={props.question} ondelete={props.ondelete} />
          </td>
          <td>{props.question.question}</td>
          <td>{props.question.answer}</td>
          <td>{props.question.distractors.join(', ')}</td>
        </tr>
    );
}


class DeleteBox extends React.Component {
    constructor() {
        super();
        this.state = {
            show: false
        }
    }

    open() {
        this.setState({show: true});
    }

    close() {
        this.setState({show: false});
    }

    delete_q() {
        this.props.ondelete(this.props.question.qid);
        this.close();
    }

    render() {
        return (
            <div>
                <span className='glyphicon glyphicon-trash'
                  onClick={() => this.open()}>
                </span>

                <Modal show={this.state.show} onHide={() => this.close()}>
                  <Modal.Header>
                    <Modal.Title>Really Delete This Question?</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>{this.props.question.question}</Modal.Body>
                  <Modal.Footer>
                    <Button bsStyle='danger' onClick={()=>this.delete_q()}>
                      Delete
                    </Button>
                    <Button onClick={()=>this.close()}>Cancel</Button>
                  </Modal.Footer>
                </Modal>
            </div>
        )
    }
}
