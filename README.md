### This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Try It
[Knowledge](https://slavkopar.github.io/knowledge-share/)

## Available Scripts

In the project directory, you can run:

### `yarn start`
### `yarn run deploy`

## Export Database to JSON
   It is  possibile to export database to JSON format, for integration to the other AI systems




## Dokumentacija (bice bolja, ovo je samo za jutrasnji miting) 




## Ideja

You are software company and You have your software product.\
Your QA people, repeatedly interupt your developers with the same questions.\
Developers need to read documentation or open Visual Studio, investigate code, returning the answer.\
It is very boring an unefficient.

With our  **Support Knowledge** Chrome Extension you can easily build and maintain your Knowledge database.\
Our extension can easily be integrated to all kind of browseres.\
Extension treats email Subject as the Question, and with single click, stores it to the database.\
Extension also eables easy return of the Answer over the email.\
Answer can be chosen from the Answers assigned to that Question .

Of course, you can use one of existing trackers, educate people, \
or even use call center with voice recognition and **AI**, and so on ...\
But it is expensive and overkill.


## Comment: Developers should be aware
   We have, at two places:\
      &lt;EditCategory inLine={true} />\
      &lt;EditCategory inLine={false} />\
   so we execute loadCategoryQuestions() twice in QuestionList, but it is OK