const faq = [
  {
    question: 'Как зарегистрироваться на сайте?',
    answer: 'Нажмите на кнопку «Регистрация» на главной странице и заполните необходимые поля. После подтверждения email вы сможете пользоваться всеми возможностями сайта.'
  },
  {
    question: 'Как создать свой тест?',
    answer: 'Перейдите в раздел «Создать тест», заполните все необходимые поля и сохраните тест. После этого он появится в вашем списке.'
  },
  {
    question: 'Как посмотреть свои результаты?',
    answer: 'В личном кабинете выберите раздел «Мои результаты» — там будут отображаться все ваши прохождения и баллы.'
  },
  {
    question: 'Как восстановить пароль?',
    answer: 'На странице входа нажмите «Забыли пароль?», введите свой email и следуйте инструкциям из письма.'
  },
  {
    question: 'Как связаться с поддержкой?',
    answer: 'Вы можете воспользоваться ссылкой «Обратная связь» в футере сайта. Мы отвечаем в Telegram-чате.'
  },
  {
    question: 'Могу ли я удалить свой аккаунт?',
    answer: 'Да, для этого напишите в поддержку через Telegram. Мы обработаем ваш запрос в кратчайшие сроки.'
  }
];

export default function FAQPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-8">Вопрос-ответ (FAQ)</h1>
      <div className="space-y-6">
        {faq.map((item, idx) => (
          <div key={idx} className="bg-neutral-50 border rounded-lg p-4">
            <div className="font-semibold mb-2 text-justify">{item.question}</div>
            <div className="text-neutral-700 text-justify">{item.answer}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 