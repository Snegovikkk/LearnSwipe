export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Пользовательское соглашение</h1>
      <div className="text-center text-neutral-600 mb-6">г. Москва</div>
      <div className="space-y-6 text-neutral-800 text-justify">
        <div>
          <p>Настоящее Соглашение определяет условия использования сайта <a href="https://www.lumeswipe.ru" className="text-primary-600 underline" target="_blank" rel="noopener noreferrer">https://www.lumeswipe.ru</a>.</p>
        </div>
        <div>
          <h2 className="font-bold text-lg mb-2">1. Общие положения</h2>
          <p>Сайт предоставляет доступ к информационным и цифровым сервисам по подписке. Пользователь обязан соблюдать настоящие условия и действующее законодательство РФ.</p>
        </div>
        <div>
          <h2 className="font-bold text-lg mb-2">2. Условия использования</h2>
          <p>Запрещается:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>использовать сайт для противоправной деятельности;</li>
            <li>вмешиваться в работу сервиса;</li>
            <li>распространять вредоносный код или спам.</li>
          </ul>
        </div>
        <div>
          <h2 className="font-bold text-lg mb-2">3. Регистрация и данные</h2>
          <p>Пользователь несёт ответственность за достоверность введённых данных и конфиденциальность доступа к аккаунту.</p>
        </div>
        <div>
          <h2 className="font-bold text-lg mb-2">4. Интеллектуальная собственность</h2>
          <p>Контент сайта принадлежит Исполнителю. Копирование и распространение без разрешения запрещено.</p>
        </div>
        <div>
          <h2 className="font-bold text-lg mb-2">5. Ответственность</h2>
          <p>Сайт предоставляется «как есть». Исполнитель не несёт ответственности за перерывы в работе или ошибки, возникшие не по его вине.</p>
        </div>
        <div>
          <h2 className="font-bold text-lg mb-2">6. Заключительные положения</h2>
          <p>Соглашение может быть изменено без предварительного уведомления. Новая редакция публикуется на сайте.</p>
        </div>
        <div>
          <h2 className="font-bold text-lg mb-2">Реквизиты владельца:</h2>
          <ul className="list-none space-y-1">
            <li><strong>Седов Дмитрий Константинович</strong></li>
            <li><strong>ИНН:</strong> 010515655477</li>
            <li><strong>Email:</strong> lumeswipe@bk.ru</li>
            <li>г. Москва</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 