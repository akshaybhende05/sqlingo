// Django quick reference — one concise, indexable page per concept.
// Plain voice; examples use the TastyGo-style models (restaurants, orders) from the course.
// Rendered by app/django-reference/[topic]/page.js.

export const categories = [
  "Basics",
  "Models & the ORM",
  "Views & URLs",
  "Templates & forms",
  "Admin, auth & APIs",
  "Advanced",
];

export const entries = [
  // ---------- Basics ----------
  {
    slug: "django-overview", name: "What is Django (MTV)", category: "Basics",
    summary: "A batteries-included Python web framework built around the Model-Template-View pattern.",
    detail: [
      "Django ships with an ORM, admin, auth, forms, templating and migrations, so you build features instead of plumbing.",
      "It uses MTV: the Model holds the data, the Template is what the user sees, and the View is the logic that ties them together.",
    ],
    related: ["model", "function-view", "templates"],
  },
  {
    slug: "project-vs-app", name: "Project vs app", category: "Basics",
    summary: "A project is the whole site and its settings; an app is a reusable feature module inside it.",
    detail: ["You run one project, which contains many apps (like orders, accounts, payments). Keeping features in separate apps keeps the code organised and reusable."],
    related: ["settings", "manage-py"],
  },
  {
    slug: "settings", name: "settings.py", category: "Basics",
    summary: "The configuration for a Django project: installed apps, database, and more.",
    syntax: "INSTALLED_APPS = [...]\nDATABASES = {...}",
    examples: [{ code: "import os\nSECRET_KEY = os.environ['SECRET_KEY']  # read from the environment", note: "Keep secrets (SECRET_KEY, database passwords) in environment variables, never in the file itself." }],
    related: ["project-vs-app", "manage-py"],
  },
  {
    slug: "manage-py", name: "manage.py commands", category: "Basics",
    summary: "The command-line tool for running and managing a Django project.",
    syntax: "python manage.py <command>",
    examples: [{ code: "python manage.py runserver        # start the dev server\npython manage.py makemigrations   # create migration files\npython manage.py migrate          # apply them\npython manage.py createsuperuser  # make an admin user", note: "These are the commands you use every day while developing." }],
    related: ["migrations", "admin"],
  },

  // ---------- Models & the ORM ----------
  {
    slug: "model", name: "Model", category: "Models & the ORM",
    summary: "A Python class that maps to a database table; each attribute is a column.",
    syntax: "class Name(models.Model):\n    field = models.CharField(max_length=100)",
    examples: [{ code: "from django.db import models\n\nclass Restaurant(models.Model):\n    name = models.CharField(max_length=100)\n    rating = models.FloatField()", note: "Django creates the table from this class when you run migrations." }],
    related: ["field-types", "migrations", "relationships"],
  },
  {
    slug: "field-types", name: "Model field types", category: "Models & the ORM",
    summary: "The column types you use in a model: text, numbers, dates, relationships.",
    syntax: "CharField, IntegerField, FloatField, BooleanField, DateField, ForeignKey",
    examples: [{ code: "name = models.CharField(max_length=100)\nrating = models.FloatField()\nactive = models.BooleanField(default=True)\njoined = models.DateField(auto_now_add=True)", note: "null=True allows a NULL in the database; blank=True allows an empty form field. They are separate." }],
    related: ["model", "relationships"],
  },
  {
    slug: "migrations", name: "Migrations", category: "Models & the ORM",
    summary: "Tracked changes to the database structure, created from your models.",
    syntax: "python manage.py makemigrations\npython manage.py migrate",
    examples: [{ code: "# after changing a model:\npython manage.py makemigrations   # write the change file\npython manage.py migrate          # apply it to the database", note: "makemigrations records the change; migrate runs it. Teammates run the same files to stay in sync." }],
    related: ["model", "manage-py"],
  },
  {
    slug: "queryset", name: "QuerySet", category: "Models & the ORM",
    summary: "A lazy collection of model rows you build with the ORM.",
    syntax: "Model.objects.all()\nModel.objects.filter(...)",
    examples: [{ code: "Restaurant.objects.all()\nRestaurant.objects.filter(city='Mumbai').order_by('-rating')", note: "A QuerySet does not hit the database until you use it (loop, list, len). You can chain filters freely." }],
    related: ["filter-get", "select-related"],
  },
  {
    slug: "filter-get", name: "filter() vs get()", category: "Models & the ORM",
    summary: "filter() returns many rows; get() returns exactly one.",
    syntax: "Model.objects.filter(...)   # a QuerySet\nModel.objects.get(id=1)     # one object",
    examples: [{ code: "Restaurant.objects.filter(city='Mumbai')   # all Mumbai restaurants\nRestaurant.objects.get(id=1)               # one, by id", note: "get() raises DoesNotExist if there is no match, and MultipleObjectsReturned if there is more than one." }],
    related: ["queryset"],
  },
  {
    slug: "relationships", name: "Model relationships", category: "Models & the ORM",
    summary: "Link models with ForeignKey (many-to-one), ManyToManyField, or OneToOneField.",
    syntax: "customer = models.ForeignKey(Customer, on_delete=models.CASCADE)",
    examples: [{ code: "class Order(models.Model):\n    customer = models.ForeignKey('Customer', on_delete=models.CASCADE)\n    amount = models.IntegerField()", note: "on_delete=CASCADE deletes the orders when their customer is deleted. Access the other side with order.customer or customer.order_set." }],
    related: ["model", "select-related"],
  },
  {
    slug: "select-related", name: "select_related & the N+1 problem", category: "Models & the ORM",
    summary: "Avoid one extra query per row by fetching related data in one go.",
    detail: [
      "The N+1 problem is running one query for a list, then one more query per row to load a related object. It quietly makes pages slow.",
      "select_related fixes it for ForeignKey/one-to-one (using a SQL JOIN); prefetch_related fixes it for many-to-many and reverse relations.",
    ],
    examples: [{ code: "# one query instead of one-per-order:\nOrder.objects.select_related('customer')", note: "Reach for these whenever you loop over a list and touch a related object inside the loop." }],
    related: ["queryset", "relationships"],
  },

  // ---------- Views & URLs ----------
  {
    slug: "function-view", name: "Function-based view", category: "Views & URLs",
    summary: "A function that takes a request and returns a response.",
    syntax: "def view(request):\n    return render(request, 'template.html', context)",
    examples: [{ code: "from django.shortcuts import render\n\ndef restaurant_list(request):\n    items = Restaurant.objects.all()\n    return render(request, 'list.html', {'items': items})", note: "Simple and explicit. Good for one-off logic." }],
    related: ["class-based-view", "urls", "templates"],
  },
  {
    slug: "class-based-view", name: "Class-based view", category: "Views & URLs",
    summary: "A reusable view built from Django's generic classes (ListView, DetailView).",
    syntax: "class NameView(ListView):\n    model = Model",
    examples: [{ code: "from django.views.generic import ListView\n\nclass RestaurantList(ListView):\n    model = Restaurant\n    template_name = 'list.html'", note: "Less code for common patterns (listing, detail, create). A steeper learning curve than function views." }],
    related: ["function-view", "urls"],
  },
  {
    slug: "urls", name: "URL routing (urls.py)", category: "Views & URLs",
    summary: "Maps a URL path to the view that handles it.",
    syntax: "urlpatterns = [ path('route/', view, name='name') ]",
    examples: [{ code: "from django.urls import path\nfrom . import views\n\nurlpatterns = [\n    path('restaurants/', views.restaurant_list, name='list'),\n    path('restaurants/<int:id>/', views.detail, name='detail'),\n]", note: "<int:id> captures a number from the URL and passes it to the view." }],
    related: ["function-view", "middleware"],
  },
  {
    slug: "middleware", name: "Middleware", category: "Views & URLs",
    summary: "Code that wraps every request and response — for auth, sessions, security.",
    detail: ["Each middleware can act on the request before the view runs and on the response after. Django ships with middleware for sessions, authentication, CSRF and security headers."],
    related: ["urls", "csrf"],
  },

  // ---------- Templates & forms ----------
  {
    slug: "templates", name: "Templates", category: "Templates & forms",
    summary: "Render HTML from a template and context data, with auto-escaping for safety.",
    syntax: "{{ variable }}   {% for x in items %} ... {% endfor %}",
    examples: [{ code: "<ul>\n{% for r in items %}\n  <li>{{ r.name }} - {{ r.rating }}</li>\n{% endfor %}\n</ul>", note: "{{ }} prints a value; {% %} runs a tag like a loop. Output is auto-escaped to prevent XSS." }],
    related: ["function-view", "forms"],
  },
  {
    slug: "forms", name: "Forms", category: "Templates & forms",
    summary: "A class that defines fields and validates submitted data.",
    syntax: "class NameForm(forms.Form):\n    field = forms.CharField()",
    examples: [{ code: "from django import forms\n\nclass ContactForm(forms.Form):\n    email = forms.EmailField()\n    message = forms.CharField(widget=forms.Textarea)", note: "form.is_valid() runs the checks; form.cleaned_data holds the validated values." }],
    related: ["modelform", "csrf"],
  },
  {
    slug: "modelform", name: "ModelForm", category: "Templates & forms",
    summary: "A form built automatically from a model, which can save straight to the database.",
    syntax: "class NameForm(forms.ModelForm):\n    class Meta:\n        model = Model\n        fields = ['a', 'b']",
    examples: [{ code: "class RestaurantForm(forms.ModelForm):\n    class Meta:\n        model = Restaurant\n        fields = ['name', 'rating']", note: "form.save() creates or updates the row for you. Less code than writing the fields by hand." }],
    related: ["forms", "model"],
  },
  {
    slug: "csrf", name: "CSRF protection", category: "Templates & forms",
    summary: "A token that stops other sites submitting forms as your logged-in user.",
    syntax: "<form method=\"post\">{% csrf_token %} ... </form>",
    examples: [{ code: "<form method=\"post\">\n  {% csrf_token %}\n  {{ form }}\n  <button>Save</button>\n</form>", note: "Django rejects a POST without a valid token. Add {% csrf_token %} inside every POST form." }],
    related: ["forms", "middleware"],
  },

  // ---------- Admin, auth & APIs ----------
  {
    slug: "admin", name: "Django admin", category: "Admin, auth & APIs",
    summary: "An auto-generated web interface to create, read, update and delete your data.",
    syntax: "admin.site.register(Model)",
    examples: [{ code: "from django.contrib import admin\nfrom .models import Restaurant\n\nadmin.site.register(Restaurant)", note: "Register a model and you get a full CRUD interface at /admin, with almost no code." }],
    related: ["authentication", "manage-py"],
  },
  {
    slug: "authentication", name: "Authentication", category: "Admin, auth & APIs",
    summary: "Django's built-in login system: who the user is.",
    syntax: "from django.contrib.auth.decorators import login_required",
    examples: [{ code: "from django.contrib.auth.decorators import login_required\n\n@login_required\ndef dashboard(request):\n    return render(request, 'dashboard.html')", note: "request.user is the logged-in user. @login_required redirects anonymous visitors to the login page." }],
    related: ["permissions", "admin"],
  },
  {
    slug: "permissions", name: "Permissions", category: "Admin, auth & APIs",
    summary: "Authorization: what a logged-in user is allowed to do.",
    detail: ["Authentication is who you are; authorization (permissions) is what you may do. Django has per-model permissions and groups, and you check them with user.has_perm() or decorators/mixins."],
    related: ["authentication"],
  },
  {
    slug: "drf", name: "Django REST Framework", category: "Admin, auth & APIs",
    summary: "A toolkit for building web APIs on top of Django.",
    detail: ["DRF adds serializers, viewsets and routers so you can turn models into a JSON API quickly. It is a separate package (pip install djangorestframework)."],
    related: ["serializer", "model"],
  },
  {
    slug: "serializer", name: "Serializer", category: "Admin, auth & APIs",
    summary: "Converts a model to and from JSON, and validates incoming data — the API version of a form.",
    syntax: "class NameSerializer(serializers.ModelSerializer):\n    class Meta:\n        model = Model\n        fields = '__all__'",
    examples: [{ code: "from rest_framework import serializers\n\nclass RestaurantSerializer(serializers.ModelSerializer):\n    class Meta:\n        model = Restaurant\n        fields = ['id', 'name', 'rating']", note: "Turns model objects into JSON for responses, and validates JSON in requests." }],
    related: ["drf", "modelform"],
  },

  // ---------- Advanced ----------
  {
    slug: "signals", name: "Signals", category: "Advanced",
    summary: "Let decoupled code react automatically to events like a model being saved.",
    syntax: "@receiver(post_save, sender=Model)\ndef handler(sender, instance, **kwargs): ...",
    examples: [{ code: "from django.db.models.signals import post_save\nfrom django.dispatch import receiver\n\n@receiver(post_save, sender=Order)\ndef on_order(sender, instance, **kwargs):\n    ...  # e.g. send a confirmation", note: "Handy for side effects, but overuse hides logic that runs 'invisibly'. Prefer an explicit call when the logic belongs together." }],
    related: ["model"],
  },
  {
    slug: "static-media", name: "Static vs media files", category: "Advanced",
    summary: "Static files are your code's assets (CSS/JS); media files are user uploads.",
    detail: ["Static files (CSS, JS, images you ship) are collected with collectstatic and served from STATIC_URL. Media files are things users upload at run time, served from MEDIA_URL. They are configured and secured separately."],
    related: ["settings"],
  },
  {
    slug: "pagination", name: "Pagination", category: "Advanced",
    summary: "Split a long list of results across pages.",
    syntax: "from django.core.paginator import Paginator",
    examples: [{ code: "from django.core.paginator import Paginator\n\np = Paginator(Restaurant.objects.all(), 10)  # 10 per page\npage = p.get_page(request.GET.get('page'))", note: "Class-based ListView also has built-in pagination via paginate_by." }],
    related: ["queryset", "class-based-view"],
  },
];

export const bySlug = Object.fromEntries(entries.map((e) => [e.slug, e]));
