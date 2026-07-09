<p align="center">
    <img src="/.github/home-page-images/laradock-logo.png?raw=true" alt="Laradock Logo"/>
</p>

<p align="center">
   <a href="https://laradock.io/contributing"><img src="https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat" alt="contributions welcome"></a>
   <a href="https://github.com/laradock/laradock/network"><img src="https://img.shields.io/github/forks/laradock/laradock.svg" alt="GitHub forks"></a>
   <a href="https://github.com/laradock/laradock/issues"><img src="https://img.shields.io/github/issues/laradock/laradock.svg" alt="GitHub issues"></a>
   <a href="https://github.com/laradock/laradock/stargazers"><a href="#backers" alt="sponsors on Open Collective"><img src="https://opencollective.com/laradock/backers/badge.svg" /></a> <a href="#sponsors" alt="Sponsors on Open Collective"><img src="https://opencollective.com/laradock/sponsors/badge.svg" /></a> <img src="https://img.shields.io/github/stars/laradock/laradock.svg" alt="GitHub stars"></a>
   <a href="https://github.com/laradock/laradock/actions/workflows/main-ci.yml"><img src="https://github.com/laradock/laradock/actions/workflows/main-ci.yml/badge.svg" alt="GitHub CI"></a>
   <a href="https://raw.githubusercontent.com/laradock/laradock/master/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="GitHub license"></a>
</p>

<div dir="rtl">

<p align="center"><b>بيئة تطوير PHP كاملة قائمة على Docker.</b></p>

<p align="center">
  🌐 <b>اللغات:</b> <a href="./README.md">English</a> · <a href="./README-zh.md">简体中文</a> · <b>العربية</b> · <a href="./README-es.md">Español</a>
</p>

<p align="center">
    <a href="https://zalt.me"><img src="http://forthebadge.com/images/badges/built-by-developers.svg" alt="forthebadge" width="180"></a>
</p>

<br>
<br>

<h2 align="center" style="color:#7d58c2">استخدم Docker أولًا، وتعلّمه لاحقًا!</h2>

## نظرة عامة

يوفّر **Laradock** بيئة تطوير PHP كاملة قائمة على Docker، مع حاويات جاهزة ومُعدّة مسبقًا لكل ما يحتاجه أي تطبيق PHP، من خوادم الويب وقواعد البيانات إلى التخزين المؤقت والطوابير، فتشغّل بيئة عمل محلية متكاملة خلال ثوانٍ ودون أي إعداد يدوي.

تعمل مع **أي مشروع PHP** وتتصرف بالطريقة نفسها على Linux وmacOS وWindows.

يضيع أول يوم في أي مشروع PHP غالبًا في إعداد البيئة، ومع Laradock تستعيده: استنساخ واحد وأمر واحد، وبيئتك كاملة تعمل فورًا.

### المتطلبات

- [Docker](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/downloads)

### البدء السريع

أنشئ بيئة تجريبية تضم `PHP` و`NGINX` و`MySQL` و`Redis` و`Composer`:

1 - استنسخ Laradock داخل مشروع PHP الخاص بك:

```shell
git clone https://github.com/Laradock/laradock.git
```

2 - ادخل مجلد laradock وأعد تسمية `.env.example` إلى `.env`.

```shell
cp .env.example .env
```

3 - شغّل الحاويات:

```shell
docker-compose up -d workspace nginx mysql redis
```

4 - افتح ملف `.env` الخاص بمشروعك واضبط ما يلي:

```shell
DB_HOST=mysql
REDIS_HOST=redis
QUEUE_HOST=beanstalkd
```

5 - افتح المتصفح وزُر localhost: `http://localhost`.

تم.

### اختيار مجموعة الخدمات

يشغّل قسم البدء السريع أعلاه مجموعة ثابتة واحدة فقط. يمكنك استبدالها بأي من هذه الخدمات:

`nginx`، `apache2`، `caddy`، `php-fpm`، `mysql`، `postgres`، `mariadb`، `mongo`، `redis`، `memcached`، `rabbitmq`، `beanstalkd`، `workspace`، والمزيد.

```shell
docker-compose up -d workspace apache2 postgres redis
```

### أوامر أساسية

- عرض الحاويات قيد التشغيل: `docker-compose ps`
- عرض سجل حاوية معيّنة: `docker logs {container-name}`
- إيقاف كل الحاويات: `docker-compose stop`
- حذف كل الحاويات: `docker-compose down`

### يعمل مع

توفّر Laradock بيئة تشغيل PHP وخادم الويب وقواعد البيانات والخدمات الخلفية التي يحتاجها تطبيقك، لذا يمكنها تشغيل أي إطار عمل أو نظام إدارة محتوى أو منصة تجارة إلكترونية تقريبًا:

- **أطر العمل:** Laravel، Symfony، CodeIgniter، Yii، Laminas (Zend Framework)، CakePHP، Phalcon، Slim، Lumen، FuelPHP
- **أنظمة إدارة المحتوى:** WordPress، Drupal، Joomla، October CMS، Statamic، Craft CMS، TYPO3، Concrete CMS، Grav
- **التجارة الإلكترونية:** Magento، WooCommerce، PrestaShop، OpenCart، Sylius، Bagisto
- **تطبيقات:** Moodle، MediaWiki، phpBB، Matomo

...أو PHP خام بدون أي إطار عمل.

### أبرز المزايا

- **بيئة مُعدّة مسبقًا:** أكثر من 70 حاوية جاهزة للاستخدام (Nginx، وApache، وCaddy، وPHP-FPM، وMySQL، وPostgreSQL، وMariaDB، وMongoDB، وRedis، وMemcached، وElasticsearch، وRabbitMQ، وBeanstalkd، والمزيد).
- **طرفية تطوير شاملة:** شغّل Artisan وComposer وNode وأي أداة سطر أوامر يحتاجها مشروعك داخل حاوية `workspace` الجاهزة، دون تثبيت أي شيء على جهازك.
- **تبديل سهل للإصدارات:** غيّر إصدار PHP (5.6–8.5) أو قاعدة البيانات أو أي خدمة من مكان واحد.
- **مستقلة عن نوع المشروع:** تعمل مع Laravel وSymfony وWordPress وDrupal وMagento أو PHP الخام.
- **متعددة المنصات:** نفس البيئة على Linux وmacOS وWindows.
- **معيارية:** شغّل فقط الحاويات التي تحتاجها، بأي تركيبة.
- **سهلة للمبتدئين:** استنسخ المشروع، وانسخ ملف env، وشغّل `docker compose up`.

### Workspace: طرفية التطوير الشاملة الخاصة بك

طرفية أوامر مُحمّلة مسبقًا بـ PHP وComposer وNode وGit وعشرات أدوات التطوير، لتشغّل داخلها كل أمر يحتاجه مشروعك دون تثبيت أي شيء على جهازك.

ادخل إليها واعمل من هناك:

```bash
docker-compose exec workspace bash
```

تعمل `artisan` و`composer` و`phpunit` و`npm` و`git` جميعها مباشرةً، دون تثبيت أي شيء على جهازك: لا PHP، ولا Composer، ولا Node، ولا أي تعارض في الإصدارات. وعند إيقاف المشروع **لن يتبقى أي أثر على جهازك.**

لماذا يُعد هذا مهمًا:

- **ابدأ خلال ثوانٍ.** كل أداة مثبّتة ومُعدّة مسبقًا، فلا حاجة لأي إعداد؛ استنسخ المشروع وابدأ العمل مباشرة.
- **حافظ على نظافة جهازك.** شغّل كل شيء داخل الحاوية؛ جهازك لن يحصل أبدًا على PHP أو Composer أو Node أو أي أداة سطر أوامر، ولن يتبقى أي شيء بعد الانتهاء.
- **اعزل كل مشروع.** يعمل كل مشروع بإصدار PHP وقاعدة بيانات خاصين به دون أي تعارض بينها.
- **أحيِ المشاريع القديمة.** شغّل التطبيقات القديمة على إصدارات PHP أقدم (5.6، 7.x) دون المساس بإصدار PHP في نظامك.

---

## تواصل معنا

لديك سؤال، أو وجدت مشكلة، أو تحتاج شيئًا؟ **mahmoud@zalt.me**

للإبلاغ عن ثغرات أمنية، راجع [SECURITY.md](SECURITY.md).

## الترخيص

[MIT](https://github.com/laradock/laradock/blob/master/LICENSE) © [Mahmoud Zalt](https://zalt.me/)

</div>
