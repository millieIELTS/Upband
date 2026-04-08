// Part 1: 30개 주제, 각 4문제
export const part1Topics = [
  { id: 1, questions: ['Do you work or are you a student?', 'What do you do for work?', 'Why did you choose that job?', 'Do you enjoy your work? Why or why not?'] },
  { id: 2, questions: ['What do you like about your hometown?', 'Has your hometown changed much in recent years?', 'Would you recommend your hometown to visitors?', 'Do you plan to live there in the future?'] },
  { id: 3, questions: ['How often do you use public transport?', 'What is the transport system like in your city?', 'Do you prefer driving or taking public transport?', 'How could public transport be improved in your area?'] },
  { id: 4, questions: ['Do you prefer reading books or watching movies?', 'What kind of books do you like to read?', 'How often do you read?', 'Do you think reading is important? Why?'] },
  { id: 5, questions: ['What kind of music do you enjoy?', 'Do you play any musical instruments?', 'Has your taste in music changed over the years?', 'Do you prefer listening to music alone or with others?'] },
  { id: 6, questions: ['Do you like cooking? Why or why not?', 'What is your favourite dish to cook?', 'Did you learn to cook from anyone?', 'Do you prefer eating at home or eating out?'] },
  { id: 7, questions: ['How do you usually spend your weekends?', 'Do you prefer a busy or relaxing weekend?', 'Has the way you spend weekends changed since you were younger?', 'What did you do last weekend?'] },
  { id: 8, questions: ['What is your favourite type of weather?', 'Does the weather affect your mood?', 'What is the weather like in your country?', 'Do you prefer hot or cold weather?'] },
  { id: 9, questions: ['Do you enjoy shopping?', 'Do you prefer shopping online or in stores?', 'What was the last thing you bought?', 'Do you think people spend too much money on shopping?'] },
  { id: 10, questions: ['Do you enjoy travelling?', 'What is the best place you have ever visited?', 'Do you prefer travelling alone or with others?', 'Where would you like to travel next?'] },
  { id: 11, questions: ['Do you like sports?', 'What sport do you enjoy the most?', 'How often do you exercise?', 'Do you prefer watching sports or playing them?'] },
  { id: 12, questions: ['What do you do to stay healthy?', 'Do you pay attention to your diet?', 'How important is exercise to you?', 'Has your lifestyle become healthier over the years?'] },
  { id: 13, questions: ['Do you use social media?', 'Which social media platform do you use the most?', 'How much time do you spend on social media daily?', 'Do you think social media is a good thing?'] },
  { id: 14, questions: ['Do you like taking photographs?', 'Do you prefer taking photos with a phone or camera?', 'What do you like to photograph?', 'Do you keep printed photos or only digital ones?'] },
  { id: 15, questions: ['What is your favourite season?', 'What do you usually do in that season?', 'Does the season affect what you eat?', 'Are the seasons changing in your country?'] },
  { id: 16, questions: ['Do you like animals?', 'Have you ever had a pet?', 'What is the most popular pet in your country?', 'Do you think it is good for children to have pets?'] },
  { id: 17, questions: ['How often do you watch TV?', 'What kind of programmes do you like?', 'Do you prefer watching TV or streaming services?', 'Did you watch a lot of TV as a child?'] },
  { id: 18, questions: ['Do you like learning languages?', 'How long have you been learning English?', 'What is the most difficult part of learning English?', 'Would you like to learn any other languages?'] },
  { id: 19, questions: ['Do you enjoy art?', 'Have you ever been to an art gallery?', 'Do you like painting or drawing?', 'Do you think art is important in education?'] },
  { id: 20, questions: ['Do you like flowers?', 'Do you ever buy flowers for people?', 'Are flowers important in your culture?', 'Would you like to grow flowers at home?'] },
  { id: 21, questions: ['How important are friends to you?', 'Do you have many close friends?', 'How do you usually keep in touch with friends?', 'Is it easy for you to make new friends?'] },
  { id: 22, questions: ['Do you like your neighbourhood?', 'How long have you lived there?', 'What would you change about your neighbourhood?', 'Do you know your neighbours well?'] },
  { id: 23, questions: ['What do you usually have for breakfast?', 'Is breakfast important to you?', 'Do you eat the same thing every morning?', 'What is a typical breakfast in your country?'] },
  { id: 24, questions: ['Do you prefer mornings or evenings?', 'What do you usually do in the morning?', 'Are you a morning person?', 'Has your daily routine changed recently?'] },
  { id: 25, questions: ['Do you enjoy birthday celebrations?', 'How do people celebrate birthdays in your country?', 'What was the best birthday you ever had?', 'Do you think birthday parties are important?'] },
  { id: 26, questions: ['Do you wear jewellery?', 'Have you ever received jewellery as a gift?', 'Is jewellery popular in your country?', 'Do you prefer gold or silver jewellery?'] },
  { id: 27, questions: ['Do you like being outdoors?', 'What outdoor activities do you enjoy?', 'How often do you spend time in nature?', 'Do you think people spend enough time outdoors?'] },
  { id: 28, questions: ['Do you like science?', 'What was your favourite subject at school?', 'Do you think science is important for everyone to learn?', 'Have you visited a science museum?'] },
  { id: 29, questions: ['Do you like maps?', 'Do you use maps when you travel?', 'Do you prefer digital maps or paper maps?', 'Are you good at reading maps?'] },
  { id: 30, questions: ['Do you like handwriting?', 'Do you prefer typing or writing by hand?', 'Is handwriting still important?', 'Do you think handwriting reveals personality?'] },
]

// Part 2 & 3: 30개 주제 세트 (Part 2 토픽카드 + Part 3 심화 질문이 매칭)
export const part2Part3Topics = [
  {
    id: 1, name: 'A Place You Visited',
    part2: { title: 'Describe a place you have visited that you particularly liked.', points: ['Where it was', 'When you went there', 'What you did there', 'And explain why you liked it'] },
    part3: ['Do you think tourism has a positive or negative effect on local communities?', 'Why do people like to travel to different places?', 'How has tourism changed in your country over the years?'],
  },
  {
    id: 2, name: 'A Useful Skill',
    part2: { title: 'Describe a skill you learned that you think is useful.', points: ['What the skill is', 'How you learned it', 'How often you use it', 'And explain why you think it is useful'] },
    part3: ['What skills are most important for young people to learn today?', 'Do you think schools teach enough practical skills?', 'How has technology changed the skills people need?'],
  },
  {
    id: 3, name: 'An Interesting Conversation',
    part2: { title: 'Describe an interesting conversation you had recently.', points: ['Who you talked to', 'Where you were', 'What you talked about', 'And explain why it was interesting'] },
    part3: ['How has technology changed the way people communicate?', 'Do you think people are becoming less social these days?', 'Is face-to-face communication better than online communication?'],
  },
  {
    id: 4, name: 'A Childhood Memory',
    part2: { title: 'Describe a happy memory from your childhood.', points: ['What happened', 'Where you were', 'Who you were with', 'And explain why this memory is special'] },
    part3: ['Do you think childhood experiences shape who we become?', 'How are childhoods today different from childhoods in the past?', 'Should children be given more freedom or more structure?'],
  },
  {
    id: 5, name: 'A Person You Admire',
    part2: { title: 'Describe a person you admire.', points: ['Who this person is', 'How you know them', 'What they have done', 'And explain why you admire them'] },
    part3: ['What qualities make a good role model?', 'Do you think celebrities are good role models for young people?', 'Has the idea of who we admire changed over generations?'],
  },
  {
    id: 6, name: 'A Book or Film',
    part2: { title: 'Describe a book or film that made a strong impression on you.', points: ['What it was about', 'When you read or watched it', 'Why you chose it', 'And explain what impression it made on you'] },
    part3: ['Do you think reading is becoming less popular?', 'How do films influence people\'s views of the world?', 'Should governments support the arts and creative industries?'],
  },
  {
    id: 7, name: 'A Festival or Celebration',
    part2: { title: 'Describe a festival or celebration that is important in your country.', points: ['What the festival is', 'When it takes place', 'What people do during it', 'And explain why it is important'] },
    part3: ['Are traditional festivals still important in modern society?', 'How have celebrations changed over time?', 'Do you think globalisation is reducing cultural diversity?'],
  },
  {
    id: 8, name: 'A Piece of Technology',
    part2: { title: 'Describe a piece of technology that you find very useful.', points: ['What it is', 'When you got it', 'How often you use it', 'And explain why it is useful to you'] },
    part3: ['Do you think people rely too much on technology?', 'What are the negative effects of technology on society?', 'How do you think technology will change our lives in the future?'],
  },
  {
    id: 9, name: 'An Achievement',
    part2: { title: 'Describe an achievement you are proud of.', points: ['What you achieved', 'When it happened', 'How you achieved it', 'And explain why you are proud of it'] },
    part3: ['Is it important for people to set goals?', 'Do you think success is mostly about talent or hard work?', 'How should society reward achievement?'],
  },
  {
    id: 10, name: 'A Journey',
    part2: { title: 'Describe a long journey you have been on.', points: ['Where you went', 'How you travelled', 'Who you were with', 'And explain how you felt about the journey'] },
    part3: ['Do you think governments should invest more in public transportation?', 'How might transport systems change in the next 20 years?', 'Should people be discouraged from using private cars?'],
  },
  {
    id: 11, name: 'A Teacher or Mentor',
    part2: { title: 'Describe a teacher who has influenced you.', points: ['Who this teacher was', 'What subject they taught', 'What made them special', 'And explain how they influenced you'] },
    part3: ['What qualities make a good teacher?', 'How do you think education will change in the future?', 'Is online learning as effective as traditional classroom learning?'],
  },
  {
    id: 12, name: 'A Healthy Lifestyle',
    part2: { title: 'Describe something you do to keep healthy.', points: ['What you do', 'How often you do it', 'Who you do it with', 'And explain why you think it is good for your health'] },
    part3: ['Whose responsibility is it to keep people healthy — individuals or governments?', 'Why do some people find it hard to maintain a healthy lifestyle?', 'Should unhealthy food be taxed more heavily?'],
  },
  {
    id: 13, name: 'A Decision You Made',
    part2: { title: 'Describe an important decision you made.', points: ['What the decision was', 'When you made it', 'How you made the decision', 'And explain how it affected your life'] },
    part3: ['Do young people make decisions differently from older people?', 'Should important decisions be made quickly or slowly?', 'How can people improve their decision-making skills?'],
  },
  {
    id: 14, name: 'A Hobby',
    part2: { title: 'Describe a hobby you enjoy.', points: ['What the hobby is', 'When you started it', 'How often you do it', 'And explain why you enjoy it'] },
    part3: ['Do you think it is important for people to have hobbies?', 'How have leisure activities changed compared to the past?', 'Should employers encourage hobbies among their employees?'],
  },
  {
    id: 15, name: 'A City You Would Like to Visit',
    part2: { title: 'Describe a city you would like to visit in the future.', points: ['What the city is', 'Where it is located', 'What you know about it', 'And explain why you would like to visit it'] },
    part3: ['What are the advantages and disadvantages of living in a big city?', 'How can cities become more environmentally friendly?', 'Do you think people will continue to move to cities in the future?'],
  },
  {
    id: 16, name: 'A Gift You Received',
    part2: { title: 'Describe a gift you received that was special to you.', points: ['What the gift was', 'Who gave it to you', 'When you received it', 'And explain why it was special'] },
    part3: ['Is gift-giving important in your culture?', 'Do you think expensive gifts are better than handmade ones?', 'How has the tradition of giving gifts changed over time?'],
  },
  {
    id: 17, name: 'A Time You Helped Someone',
    part2: { title: 'Describe a time when you helped someone.', points: ['Who you helped', 'What the situation was', 'How you helped them', 'And explain how you felt about helping'] },
    part3: ['Should people always help others in need?', 'Do you think people are less willing to help strangers today?', 'What role should charities play in society?'],
  },
  {
    id: 18, name: 'A Language',
    part2: { title: 'Describe a language you would like to learn other than English.', points: ['What the language is', 'Why you want to learn it', 'How you plan to learn it', 'And explain how it would be useful'] },
    part3: ['Is it important to learn foreign languages?', 'Do you think translation technology will replace language learning?', 'Should all children learn a second language at school?'],
  },
  {
    id: 19, name: 'An Environmental Issue',
    part2: { title: 'Describe an environmental problem in your area.', points: ['What the problem is', 'What causes it', 'How it affects people', 'And explain what could be done to solve it'] },
    part3: ['Do you think individuals can make a difference to the environment?', 'Should governments impose stricter environmental laws?', 'How has awareness of environmental issues changed?'],
  },
  {
    id: 20, name: 'A Job You Would Like',
    part2: { title: 'Describe a job you would like to have in the future.', points: ['What the job is', 'What skills it requires', 'Why you would like it', 'And explain how you would prepare for it'] },
    part3: ['What factors do people consider when choosing a career?', 'Is job satisfaction more important than salary?', 'How will the job market change in the next decade?'],
  },
  {
    id: 21, name: 'A Rule You Disagree With',
    part2: { title: 'Describe a rule or law you disagree with.', points: ['What the rule is', 'Who it affects', 'Why you disagree with it', 'And explain what you would change about it'] },
    part3: ['Are rules necessary for a well-functioning society?', 'Do young people follow rules less than older generations?', 'How should rules be made in a democratic society?'],
  },
  {
    id: 22, name: 'A Piece of News',
    part2: { title: 'Describe a piece of news that you found interesting.', points: ['What the news was about', 'Where you heard it', 'When you heard it', 'And explain why you found it interesting'] },
    part3: ['What role does the media play in our daily lives?', 'Should there be stricter regulations on news reporting?', 'How has the internet changed the way we consume news?'],
  },
  {
    id: 23, name: 'A Childhood Friend',
    part2: { title: 'Describe a friend you had when you were a child.', points: ['Who this friend was', 'How you met', 'What you used to do together', 'And explain what made your friendship special'] },
    part3: ['Is it better to have a few close friends or many acquaintances?', 'How do friendships change as people get older?', 'Do you think online friendships are as meaningful as offline ones?'],
  },
  {
    id: 24, name: 'A Sport or Game',
    part2: { title: 'Describe a sport or game you enjoy playing.', points: ['What it is', 'How often you play it', 'Who you play it with', 'And explain why you enjoy it'] },
    part3: ['Should sports be compulsory in schools?', 'Do professional athletes earn too much money?', 'How does sport bring people together?'],
  },
  {
    id: 25, name: 'A Building You Like',
    part2: { title: 'Describe a building you find interesting or beautiful.', points: ['What the building is', 'Where it is located', 'What it looks like', 'And explain why you find it interesting'] },
    part3: ['Should old buildings be preserved or replaced with modern ones?', 'How does architecture reflect a country\'s culture?', 'Do you think cities need more green spaces?'],
  },
  {
    id: 26, name: 'A Time You Were Late',
    part2: { title: 'Describe a time when you were late for something.', points: ['When it happened', 'Where you were going', 'Why you were late', 'And explain how you felt about being late'] },
    part3: ['Is punctuality important in your culture?', 'Why are some people always late?', 'How does being late affect others?'],
  },
  {
    id: 27, name: 'A Musical Experience',
    part2: { title: 'Describe a time you enjoyed a piece of music or a concert.', points: ['What the music was', 'Where you heard it', 'Who you were with', 'And explain why you enjoyed it'] },
    part3: ['How important is music in people\'s lives?', 'Has the way people listen to music changed in recent years?', 'Should music education be compulsory in schools?'],
  },
  {
    id: 28, name: 'A Challenging Experience',
    part2: { title: 'Describe a challenge you have faced.', points: ['What the challenge was', 'When it happened', 'How you dealt with it', 'And explain what you learned from it'] },
    part3: ['Do challenges make people stronger?', 'How should parents prepare children for challenges in life?', 'Is it better to avoid risks or to take them?'],
  },
  {
    id: 29, name: 'A Shopping Experience',
    part2: { title: 'Describe a memorable shopping experience.', points: ['Where you went', 'What you bought', 'Who you were with', 'And explain why it was memorable'] },
    part3: ['How has online shopping changed consumer behaviour?', 'Do you think shopping malls will disappear in the future?', 'Is consumerism a problem in modern society?'],
  },
  {
    id: 30, name: 'A Historical Event',
    part2: { title: 'Describe a historical event that you find interesting.', points: ['What the event was', 'When and where it took place', 'What happened', 'And explain why you find it interesting'] },
    part3: ['Is it important to learn about history?', 'How can we make history more interesting for young people?', 'Do you think history repeats itself?'],
  },
]

// Part 3 topics derived from part2Part3Topics for the selection page
export const part3Topics = part2Part3Topics.map(t => ({
  id: t.id,
  name: t.name,
  questions: t.part3,
}))
