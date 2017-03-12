"use strict";
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import QuestionGame from './game'
import QuestionAdmin from './admin'


$(document).ready(function() {
    var game = <QuestionGame />;
    var admin = <QuestionAdmin />;

    var admin_link = function() {
        $('#game-link').click(game_link);
        $('#game-link').parent().removeClass('active');

        $('#admin-link').parent().addClass('active');
        $('#admin-link').unbind('click', admin_link);

        ReactDOM.render(
            admin,
            document.getElementById('react-root')
        );
    }

    var game_link = function() {
        $('#admin-link').click(admin_link);
        $('#admin-link').parent().removeClass('active');

        $('#game-link').parent().addClass('active');
        $('#game-link').unbind('click', game_link);

        ReactDOM.render(
            game,
            document.getElementById('react-root')
        );
    }

    if(window.location.hash === '#admin') {
        ReactDOM.render(admin, document.getElementById('react-root'));
        admin_link();
    }
    else {
        ReactDOM.render(game, document.getElementById('react-root'));
        game_link();
    }

});
