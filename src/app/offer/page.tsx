export default function OfferPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Публичная оферта на оказание платных услуг</h1>
      <div className="text-center text-neutral-600 mb-6">
        г. Москва<br />
        Дата размещения: 30.06.2025
      </div>
      <div className="space-y-6 text-neutral-800 text-justify">
        <div>
          <p>
            Самозанятый гражданин Седов Дмитрий Константинович, ИНН 010515655477, e-mail: lumeswipe@bk.ru, именуемый в дальнейшем «Исполнитель», предлагает любому дееспособному лицу (далее — «Заказчик») заключить настоящий договор на оказание информационных услуг через сайт <a href="https://www.lumeswipe.ru" className="text-primary-600 underline" target="_blank" rel="noopener noreferrer">https://www.lumeswipe.ru</a>.
          </p>
        </div>
        <div>
          <h2 className="font-bold text-lg mb-2">1. Предмет договора</h2>
          <p>
            Исполнитель предоставляет доступ к платной подписке на функционал сайта. Заказчик обязуется оплатить услугу в размере 99 рублей в месяц.
          </p>
        </div>
        <div>
          <h2 className="font-bold text-lg mb-2">2. Стоимость и порядок оплаты</h2>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Стоимость: 99 ₽ в месяц.</li>
            <li>Оплата производится через встроенную платёжную систему. Услуга считается оказанной с момента активации подписки.</li>
          </ul>
        </div>
        <div>
          <h2 className="font-bold text-lg mb-2">3. Права и обязанности сторон</h2>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Исполнитель обязуется обеспечить стабильный доступ, Заказчик обязуется не передавать доступ третьим лицам.</li>
            <li>Возврат средств возможен только при технической невозможности оказания услуги.</li>
          </ul>
        </div>
        <div>
          <h2 className="font-bold text-lg mb-2">4. Ответственность</h2>
          <p>
            Стороны несут ответственность в рамках законодательства РФ. Исполнитель не отвечает за сбои, вызванные внешними факторами.
          </p>
        </div>
        <div>
          <h2 className="font-bold text-lg mb-2">5. Акцепт</h2>
          <p>
            Факт оплаты считается акцептом настоящей оферты. С этого момента договор считается заключённым.
          </p>
        </div>
        <div>
          <h2 className="font-bold text-lg mb-2">6. Реквизиты Исполнителя:</h2>
          <ul className="list-none space-y-1">
            <li><strong>Седов Дмитрий Константинович</strong></li>
            <li><strong>ИНН:</strong> 010515655477</li>
            <li><strong>Email:</strong> lumeswipe@bk.ru</li>
            <li><strong>Адрес:</strong> г. Москва</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 