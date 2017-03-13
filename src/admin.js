"use strict";
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import { FormControl, FormGroup, InputGroup, ControlLabel, Modal, Button,
         Glyphicon, Pager } from 'react-bootstrap';


export default class QuestionAdmin extends React.Component {
    constructor() {
        super();
        this.state = {
            questions: [],
            page: 1,
        }
    }

    componentDidMount() {
        this.load_questions();
    }

    load_questions(page) {
        if(page === undefined) {
            page = this.state.page
        }

        var that = this;
        $.ajax({
            url: "/questions/?sort=desc&results_per_page=25&page=" + page,
        })
        .done(function(data) {
            that.setState({
                questions: data,
                page: page
            });
        })
    }

    clean_question(question) {
        question.distractors = question.distractors.filter((x) => x !== '');
        if(question.distractors.length === 0) {
            question.distractors = ['']
        }
        return question
    }

    delete_question(qid) {
        var that = this;
        $.ajax({
            url: '/questions/' + qid + '/',
            method: 'DELETE'
        })
        .done(function(data) {
            that.load_questions();
        })
        .fail(function(jqXHR, textStatus) {
            alert("DELETE Request failed: " + textStatus);
        });
    }

    edit_question(question) {
        var that = this;
        $.ajax({
            url: '/questions/' + question.qid + '/',
            method: 'PUT',
            data: this.clean_question(question),
            traditional: true
        })
        .done(function(data) {
            that.load_questions();
        })
    }

    add_question(question) {
        var that = this;
        $.ajax({
            url: '/questions/',
            method: 'POST',
            data: this.clean_question(question),
            traditional: true
        })
        .done(function(data) {
            that.load_questions();
        })

    }

    next_page() {
        const next = this.state.page + 1;
        this.load_questions(next);
    }

    previous_page() {
        const next = this.state.page - 1;
        this.load_questions(next);
    }

    render() {
        return (
          <div>
            <Pager>
              <Pager.Item previous
                disabled={this.state.page === 1}
                onClick={()=>this.previous_page()}>
                Previous
              </Pager.Item>
              Page {this.state.page}
              <Pager.Item next onClick={()=>this.next_page()}>Next</Pager.Item>
            </Pager>
            <QuestionForm onsave={(q)=>this.add_question(q)}>
              Add Question
            </QuestionForm>
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
                    onedit={(q) => this.edit_question(q)}
                    ondelete={(qid) => this.delete_question(qid)} />
                )}
              </tbody>
            </table>
          </div>
        );
    }
}


function QuestionEntry(props) {
    return (
        <tr>
          <td>
            <QuestionForm question={props.question} onsave={props.onedit}>
              <Glyphicon glyph='pencil' />
            </QuestionForm>
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
          <div style={ {display: 'inline-block'} }>
            <Button onClick={() => this.open()}>
              <Glyphicon glyph='trash' />
            </Button>

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


// Gives an edit form when passed question prop, otherwise gives an add form
class QuestionForm extends React.Component {
    constructor(props) {
        super(props);
        if(props.question === undefined) {
            this.type = 'add';
            this.original_question = {
                question: '',
                answer: '',
                distractors: ['']
            }
        }
        else {
            this.type = 'edit';
            this.original_question = props.question;
        }

        this.state = {
            show: false,
            // deep copy question object so we don't clobber the state
            question: $.extend(true, {}, this.original_question)
        }
    }

    open() {
        this.setState({show: true});
    }

    close() {
        // reload original question object; we want to lose our changes if
        // we close the edit box without saving
        this.setState({
            show: false,
            question: $.extend(true, {}, this.original_question)
        });
    }

    save() {
        this.props.onsave(this.state.question);
        this.close();
    }

    formHandler(e) {
        var question = this.state.question;
        question[e.target.name] = e.target.value;
        this.setState({question: question});
    }

    distractorHandler(i, e) {
        var question = this.state.question;
        question.distractors[i] = e.target.value;
        this.setState({question: question})
    }

    addDistractor() {
        var question = this.state.question;
        question.distractors = question.distractors.concat(['']);
        this.setState({question: question})
    }

    removeDistractor(i) {
        var question = this.state.question;
        question.distractors = question.distractors.slice();
        question.distractors.splice(i, 1);
        this.setState({question: question})
    }

    render() {
        return (
          <div style={ {display: 'inline-block'} }>
            <Button onClick={() => this.open()}>
              {this.props.children}
            </Button>

            <Modal show={this.state.show} onHide={() => this.close()}>
              <Modal.Header>
                <Modal.Title>
                  {this.type==='edit'?'Edit':'Add'} Question
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <form>
                <FormGroup controlId='question'>
                  <ControlLabel>Question</ControlLabel>
                  <FormControl
                    name='question'
                    type='text'
                    value={this.state.question.question}
                    onChange={(e) => this.formHandler(e)}
                  />
                </FormGroup>
                <FormGroup controlId='answer'>
                  <ControlLabel>Answer</ControlLabel>
                  <FormControl
                    name='answer'
                    type='text'
                    value={this.state.question.answer}
                    onChange={(e) => this.formHandler(e)}
                  />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Wrong Answers</ControlLabel>
                  {this.state.question.distractors.map((distractor, i) =>
                      <InputGroup key={i}>
                        <FormControl
                          name={'distractor' + i}
                          type='text'
                          value={distractor}
                          onChange={(e) => this.distractorHandler(i,e)}
                        />
                        <InputGroup.Button>
                          <Button onClick={()=>this.removeDistractor(i)}>
                          <Glyphicon glyph="minus" />
                          </Button>
                        </InputGroup.Button>
                      </InputGroup>
                  )}
                </FormGroup>
                <Button onClick={()=>this.addDistractor()}>
                  <Glyphicon glyph='plus' />
                </Button>
                </form>
              </Modal.Body>
              <Modal.Footer>
                <Button bsStyle='primary' onClick={()=>this.save()}>
                  Save
                </Button>
                <Button onClick={()=>this.close()}>Cancel</Button>
              </Modal.Footer>
            </Modal>
          </div>
        )
    }
}
