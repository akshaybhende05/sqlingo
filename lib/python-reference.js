// Python quick reference — one concise, indexable page per concept/built-in.
// Plain voice; examples run in the browser Python (Pyodide) used by the course.
// Rendered by app/python-reference/[topic]/page.js.

export const categories = [
  "Basics",
  "Data types & structures",
  "Control flow",
  "Functions",
  "Built-in functions",
  "Iteration & comprehensions",
  "Object-oriented Python",
  "Errors & exceptions",
  "Modules & files",
  "Advanced",
];

export const entries = [
  // ---------- Basics ----------
  {
    slug: "variables", name: "Variables", category: "Basics",
    summary: "A variable is a name for a value. You create one by assigning with =.",
    syntax: "name = value",
    examples: [{ code: "name = 'Priya'\nage = 27\nprint(name, age)", note: "No type declaration is needed; Python works out the type from the value." }],
    related: ["numbers", "strings", "print-input"],
  },
  {
    slug: "numbers", name: "Numbers (int & float)", category: "Basics",
    summary: "Whole numbers are int; numbers with a decimal are float.",
    syntax: "a = 5      # int\nb = 2.5    # float",
    examples: [{ code: "print(7 + 2)     # 9\nprint(7 / 2)     # 3.5 (always float)\nprint(7 // 2)    # 3   (integer division)\nprint(7 % 2)     # 1   (remainder)", note: "/ always gives a float; // rounds down; % is the remainder." }],
    related: ["variables", "booleans"],
  },
  {
    slug: "strings", name: "Strings", category: "Basics",
    summary: "Text, written in single or double quotes. f-strings insert values.",
    syntax: "name = 'Priya'\ngreeting = f'Hi {name}'",
    examples: [{ code: "name = 'Priya'\nprint(f'Hi {name}, welcome')\nprint('a' + 'b')   # ab", note: "An f-string (f'...') drops a variable straight into the text inside {}." }],
    related: ["string-methods", "slicing", "variables"],
  },
  {
    slug: "booleans", name: "Booleans & and/or/not", category: "Basics",
    summary: "True or False values, combined with and, or, not.",
    syntax: "x = True\ny = 5 > 3      # True",
    examples: [{ code: "age = 20\nprint(age >= 18 and age < 60)   # True\nprint(not False)                 # True", note: "Comparisons (>, <, ==) give a boolean; and/or/not combine them." }],
    related: ["if-else", "numbers"],
  },
  {
    slug: "comments", name: "Comments", category: "Basics",
    summary: "Notes in the code that Python ignores.",
    syntax: "# a single-line comment",
    examples: [{ code: "# work out the total\ntotal = 10 + 5\n'''\nA triple-quoted string is often\nused as a multi-line comment.\n'''", note: "Use # for a line; a triple-quoted string can span several lines." }],
    related: ["variables"],
  },
  {
    slug: "print-input", name: "print() and input()", category: "Basics",
    summary: "print() shows output; input() reads text the user types.",
    syntax: "print(value)\nname = input('Your name: ')",
    examples: [{ code: "print('Hello')\nname = input('Your name: ')\nprint('Hi', name)", note: "input() always returns text — convert with int() or float() if you need a number." }],
    related: ["strings", "variables"],
  },

  // ---------- Data types & structures ----------
  {
    slug: "list", name: "list", category: "Data types & structures",
    summary: "An ordered, changeable collection. Allows duplicates.",
    syntax: "nums = [1, 2, 3]",
    examples: [{ code: "nums = [1, 2, 3]\nnums.append(4)     # add to the end\nprint(nums[0])     # 1 (first item)\nprint(len(nums))   # 4", note: "Lists are indexed from 0 and can grow or shrink." }],
    related: ["tuple", "slicing", "for-loop"],
  },
  {
    slug: "tuple", name: "tuple", category: "Data types & structures",
    summary: "An ordered collection that cannot be changed after it is made.",
    syntax: "point = (10, 20)",
    examples: [{ code: "point = (10, 20)\nprint(point[0])    # 10\nx, y = point       # unpack into two variables", note: "Use a tuple for a fixed group of values that should not change." }],
    related: ["list", "set"],
  },
  {
    slug: "set", name: "set", category: "Data types & structures",
    summary: "An unordered collection of unique values (no duplicates).",
    syntax: "s = {1, 2, 3}",
    examples: [{ code: "s = {1, 2, 2, 3}\nprint(s)           # {1, 2, 3}\nprint(2 in s)      # True", note: "Duplicates are dropped automatically. Great for fast 'is it in here?' checks." }],
    related: ["list", "dict"],
  },
  {
    slug: "dict", name: "dict", category: "Data types & structures",
    summary: "A collection of key-value pairs, looked up by key.",
    syntax: "user = {'name': 'Priya', 'age': 27}",
    examples: [{ code: "user = {'name': 'Priya', 'age': 27}\nprint(user['name'])          # Priya\nprint(user.get('city', '?'))  # ? (safe default)", note: "Look up a value by its key. .get() avoids an error when the key is missing." }],
    related: ["set", "list"],
  },
  {
    slug: "string-methods", name: "String methods", category: "Data types & structures",
    summary: "Built-in tools on strings: upper, lower, strip, split, replace, join.",
    syntax: "text.upper()   text.split(',')   ','.join(parts)",
    examples: [{ code: "s = '  Hello, World  '\nprint(s.strip())          # 'Hello, World'\nprint(s.lower())          # '  hello, world  '\nprint('a,b,c'.split(','))  # ['a', 'b', 'c']", note: "Strings cannot be changed in place; these methods return a new string." }],
    related: ["strings", "slicing"],
  },
  {
    slug: "slicing", name: "Slicing", category: "Data types & structures",
    summary: "Take part of a list or string with [start:stop:step].",
    syntax: "seq[start:stop:step]",
    examples: [{ code: "nums = [10, 20, 30, 40, 50]\nprint(nums[1:3])    # [20, 30]  (stop is excluded)\nprint(nums[::-1])   # reversed\nprint('hello'[0:3]) # 'hel'", note: "The stop index is not included. A step of -1 reverses." }],
    related: ["list", "strings"],
  },

  // ---------- Control flow ----------
  {
    slug: "if-else", name: "if / elif / else", category: "Control flow",
    summary: "Run different code depending on a condition.",
    syntax: "if condition:\n    ...\nelif other:\n    ...\nelse:\n    ...",
    examples: [{ code: "age = 20\nif age < 13:\n    print('child')\nelif age < 18:\n    print('teen')\nelse:\n    print('adult')", note: "Indentation (4 spaces) marks the block that belongs to each branch." }],
    related: ["booleans", "ternary"],
  },
  {
    slug: "for-loop", name: "for loop", category: "Control flow",
    summary: "Repeat code once for each item in a sequence.",
    syntax: "for item in sequence:\n    ...",
    examples: [{ code: "for name in ['Priya', 'Rahul']:\n    print(name)\n\nfor i in range(3):\n    print(i)    # 0, 1, 2", note: "A for loop walks through a list, string, range, or any iterable." }],
    related: ["while-loop", "range", "enumerate"],
  },
  {
    slug: "while-loop", name: "while loop", category: "Control flow",
    summary: "Repeat code as long as a condition stays true.",
    syntax: "while condition:\n    ...",
    examples: [{ code: "n = 3\nwhile n > 0:\n    print(n)\n    n -= 1", note: "Make sure something inside the loop changes, or it runs forever." }],
    related: ["for-loop", "break-continue"],
  },
  {
    slug: "break-continue", name: "break & continue", category: "Control flow",
    summary: "break stops a loop early; continue skips to the next turn.",
    syntax: "break        # exit the loop\ncontinue     # skip to next iteration",
    examples: [{ code: "for n in range(10):\n    if n == 5:\n        break        # stop at 5\n    if n % 2 == 0:\n        continue     # skip even numbers\n    print(n)         # 1, 3", note: "break leaves the loop entirely; continue jumps to the next item." }],
    related: ["for-loop", "while-loop"],
  },
  {
    slug: "range", name: "range()", category: "Control flow",
    summary: "Produce a sequence of numbers, often used with for loops.",
    syntax: "range(stop)\nrange(start, stop, step)",
    examples: [{ code: "for i in range(1, 10, 2):\n    print(i)    # 1, 3, 5, 7, 9", note: "The stop value is not included. Step controls the gap between numbers." }],
    related: ["for-loop", "enumerate"],
  },
  {
    slug: "ternary", name: "Ternary (inline if)", category: "Control flow",
    summary: "Choose one of two values on a single line.",
    syntax: "value = a if condition else b",
    examples: [{ code: "age = 20\nlabel = 'adult' if age >= 18 else 'minor'\nprint(label)   # adult", note: "A compact if/else for picking a value." }],
    related: ["if-else"],
  },

  // ---------- Functions ----------
  {
    slug: "def", name: "def (defining a function)", category: "Functions",
    summary: "Create a reusable block of code that you call by name.",
    syntax: "def name(parameters):\n    return value",
    examples: [{ code: "def greet(name):\n    return f'Hi {name}'\n\nprint(greet('Priya'))   # Hi Priya", note: "Parameters are inputs; return sends a value back to the caller." }],
    related: ["return", "default-args", "args-kwargs"],
  },
  {
    slug: "return", name: "return", category: "Functions",
    summary: "Send a value back from a function to whoever called it.",
    syntax: "def f():\n    return value",
    examples: [{ code: "def square(n):\n    return n * n\n\nresult = square(5)\nprint(result)   # 25", note: "A function without return gives back None. return also ends the function." }],
    related: ["def"],
  },
  {
    slug: "default-args", name: "Default arguments", category: "Functions",
    summary: "Give a parameter a fallback value used when the caller omits it.",
    syntax: "def f(x, y=10):\n    ...",
    examples: [{ code: "def greet(name, greeting='Hi'):\n    return f'{greeting} {name}'\n\nprint(greet('Priya'))          # Hi Priya\nprint(greet('Priya', 'Hello'))  # Hello Priya", note: "Never use a changeable default like a list; use None and create it inside." }],
    related: ["def", "args-kwargs"],
  },
  {
    slug: "args-kwargs", name: "*args and **kwargs", category: "Functions",
    summary: "Accept any number of extra positional (*args) or keyword (**kwargs) arguments.",
    syntax: "def f(*args, **kwargs):\n    ...",
    examples: [{ code: "def total(*nums):\n    return sum(nums)\n\nprint(total(1, 2, 3))   # 6", note: "*args collects extra values into a tuple; **kwargs collects named ones into a dict." }],
    related: ["def", "default-args"],
  },
  {
    slug: "lambda", name: "lambda", category: "Functions",
    summary: "A small, unnamed function written on one line.",
    syntax: "lambda parameters: expression",
    examples: [{ code: "double = lambda x: x * 2\nprint(double(5))   # 10\n\nnums = [3, 1, 2]\nprint(sorted(nums, key=lambda n: -n))  # [3, 2, 1]", note: "Handy as a quick key= for sorting. For anything longer, use def." }],
    related: ["def", "sorted", "map-filter"],
  },
  {
    slug: "scope", name: "Scope (local & global)", category: "Functions",
    summary: "Where a variable is visible: inside a function (local) or everywhere (global).",
    syntax: "global name        # reassign a global from inside a function",
    examples: [{ code: "count = 0\ndef bump():\n    global count\n    count += 1\n\nbump()\nprint(count)   # 1", note: "Python looks up names in order: Local, Enclosing, Global, Built-in (LEGB)." }],
    related: ["def"],
  },

  // ---------- Built-in functions ----------
  {
    slug: "len", name: "len()", category: "Built-in functions",
    summary: "Return the number of items in a list, string, dict, or set.",
    syntax: "len(x)",
    examples: [{ code: "print(len([1, 2, 3]))   # 3\nprint(len('hello'))      # 5", note: "Works on anything with a length." }],
    related: ["list", "strings"],
  },
  {
    slug: "enumerate", name: "enumerate()", category: "Built-in functions",
    summary: "Loop over a sequence with both the index and the value.",
    syntax: "for i, value in enumerate(sequence):\n    ...",
    examples: [{ code: "for i, name in enumerate(['a', 'b']):\n    print(i, name)   # 0 a / 1 b", note: "Cleaner than tracking a counter variable yourself." }],
    related: ["for-loop", "zip"],
  },
  {
    slug: "zip", name: "zip()", category: "Built-in functions",
    summary: "Pair up items from two or more sequences.",
    syntax: "zip(seq1, seq2)",
    examples: [{ code: "names = ['Priya', 'Rahul']\nages = [27, 30]\nfor name, age in zip(names, ages):\n    print(name, age)", note: "Stops at the shortest sequence." }],
    related: ["enumerate", "for-loop"],
  },
  {
    slug: "sorted", name: "sorted()", category: "Built-in functions",
    summary: "Return a new sorted list from any sequence.",
    syntax: "sorted(sequence, key=..., reverse=...)",
    examples: [{ code: "print(sorted([3, 1, 2]))                 # [1, 2, 3]\nprint(sorted(['bb', 'a'], key=len))       # ['a', 'bb']\nprint(sorted([3, 1, 2], reverse=True))    # [3, 2, 1]", note: "key= sorts by a computed value; reverse=True flips the order." }],
    related: ["lambda", "list"],
  },
  {
    slug: "map-filter", name: "map() and filter()", category: "Built-in functions",
    summary: "Apply a function to every item (map) or keep items that pass a test (filter).",
    syntax: "map(func, seq)\nfilter(func, seq)",
    examples: [{ code: "nums = [1, 2, 3, 4]\nprint(list(map(lambda n: n * 2, nums)))     # [2, 4, 6, 8]\nprint(list(filter(lambda n: n % 2 == 0, nums)))  # [2, 4]", note: "Wrap in list() to see the result. A comprehension often reads more clearly." }],
    related: ["lambda", "sorted"],
  },
  {
    slug: "sum-min-max", name: "sum(), min(), max()", category: "Built-in functions",
    summary: "Add up, or find the smallest or largest value in a sequence.",
    syntax: "sum(seq)   min(seq)   max(seq)",
    examples: [{ code: "nums = [3, 1, 4, 1, 5]\nprint(sum(nums))   # 14\nprint(min(nums))   # 1\nprint(max(nums))   # 5", note: "min/max also take a key= argument, like sorted." }],
    related: ["sorted", "len"],
  },
  // ---------- Iteration & comprehensions ----------
  {
    slug: "list-comprehension", name: "List comprehension", category: "Iteration & comprehensions",
    summary: "Build a list in one line from another sequence.",
    syntax: "[expression for item in sequence if condition]",
    examples: [{ code: "squares = [n * n for n in range(5)]\nprint(squares)                 # [0, 1, 4, 9, 16]\nevens = [n for n in range(10) if n % 2 == 0]\nprint(evens)                   # [0, 2, 4, 6, 8]", note: "Shorter and clearer than a for loop that appends to a list." }],
    related: ["dict-comprehension", "for-loop", "generator"],
  },
  {
    slug: "dict-comprehension", name: "Dict & set comprehension", category: "Iteration & comprehensions",
    summary: "Build a dict or set in one line, the same way as a list comprehension.",
    syntax: "{key: value for item in sequence}\n{item for item in sequence}",
    examples: [{ code: "names = ['Priya', 'Rahul']\nlengths = {name: len(name) for name in names}\nprint(lengths)   # {'Priya': 5, 'Rahul': 5}\nunique = {c for c in 'banana'}\nprint(unique)    # {'b', 'a', 'n'}", note: "Curly braces with a colon make a dict; without a colon make a set." }],
    related: ["list-comprehension", "dict", "set"],
  },
  {
    slug: "generator", name: "Generator (yield)", category: "Iteration & comprehensions",
    summary: "A function that produces values one at a time, using yield, without building a whole list.",
    syntax: "def gen():\n    yield value",
    examples: [{ code: "def first_n(n):\n    i = 0\n    while i < n:\n        yield i\n        i += 1\n\nprint(sum(first_n(1000)))   # uses almost no memory", note: "Each yield pauses the function and hands back one value, resuming on the next request." }],
    related: ["generator-expression", "iterator", "for-loop"],
  },
  {
    slug: "generator-expression", name: "Generator expression", category: "Iteration & comprehensions",
    summary: "Like a list comprehension, but lazy — it produces values on demand.",
    syntax: "(expression for item in sequence)",
    examples: [{ code: "total = sum(n * n for n in range(1000))\nprint(total)", note: "Round brackets instead of square. Use it when you only iterate once, to save memory." }],
    related: ["list-comprehension", "generator"],
  },
  {
    slug: "iterator", name: "Iterator (iter & next)", category: "Iteration & comprehensions",
    summary: "An object that hands back items one at a time when asked.",
    syntax: "it = iter(sequence)\nnext(it)",
    examples: [{ code: "it = iter([10, 20])\nprint(next(it))   # 10\nprint(next(it))   # 20", note: "A for loop uses this under the hood: it calls iter() then next() until the items run out." }],
    related: ["generator", "for-loop"],
  },

  // ---------- Object-oriented Python ----------
  {
    slug: "class", name: "class", category: "Object-oriented Python",
    summary: "A blueprint for making objects that bundle data and behaviour together.",
    syntax: "class Name:\n    def method(self):\n        ...",
    examples: [{ code: "class Dog:\n    def __init__(self, name):\n        self.name = name\n    def speak(self):\n        return f'{self.name} says woof'\n\nd = Dog('Rex')\nprint(d.speak())   # Rex says woof", note: "self is the object itself, passed automatically to each method." }],
    related: ["init", "inheritance", "dunder-methods"],
  },
  {
    slug: "init", name: "__init__ (constructor)", category: "Object-oriented Python",
    summary: "The method that runs when you create an object, used to set up its data.",
    syntax: "def __init__(self, ...):\n    self.attr = value",
    examples: [{ code: "class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\np = Point(1, 2)\nprint(p.x, p.y)   # 1 2", note: "Store the object's starting values on self here." }],
    related: ["class", "dataclass"],
  },
  {
    slug: "inheritance", name: "Inheritance", category: "Object-oriented Python",
    summary: "Make a class that reuses and extends another class.",
    syntax: "class Child(Parent):\n    ...",
    examples: [{ code: "class Animal:\n    def speak(self):\n        return '...'\n\nclass Cat(Animal):\n    def speak(self):\n        return 'meow'\n\nprint(Cat().speak())   # meow", note: "Cat gets everything from Animal and can override or add to it." }],
    related: ["class", "super"],
  },
  {
    slug: "super", name: "super()", category: "Object-oriented Python",
    summary: "Call a method from the parent class, often inside an overridden method.",
    syntax: "super().method(...)",
    examples: [{ code: "class Animal:\n    def __init__(self, name):\n        self.name = name\n\nclass Dog(Animal):\n    def __init__(self, name, breed):\n        super().__init__(name)   # run Animal's __init__\n        self.breed = breed", note: "Lets the child reuse the parent's setup instead of repeating it." }],
    related: ["inheritance", "init"],
  },
  {
    slug: "dunder-methods", name: "Dunder methods", category: "Object-oriented Python",
    summary: "Special methods with double underscores that hook into Python's built-in behaviour.",
    syntax: "def __str__(self): ...\ndef __eq__(self, other): ...\ndef __len__(self): ...",
    examples: [{ code: "class Money:\n    def __init__(self, rupees):\n        self.rupees = rupees\n    def __str__(self):\n        return f'Rs {self.rupees}'\n\nprint(Money(50))   # Rs 50", note: "__str__ controls print(); __eq__ controls ==; __len__ controls len()." }],
    related: ["class", "property"],
  },
  {
    slug: "property", name: "@property", category: "Object-oriented Python",
    summary: "Expose a method as if it were a simple attribute, often for a computed value.",
    syntax: "@property\ndef name(self):\n    return ...",
    examples: [{ code: "class Circle:\n    def __init__(self, r):\n        self.r = r\n    @property\n    def area(self):\n        return 3.14159 * self.r * self.r\n\nc = Circle(2)\nprint(c.area)   # 12.56636 (no parentheses)", note: "Access it like c.area, not c.area(). Useful for values derived from other data." }],
    related: ["class", "dunder-methods"],
  },
  {
    slug: "dataclass", name: "@dataclass", category: "Object-oriented Python",
    summary: "Auto-generate __init__, __repr__ and __eq__ for a class that mainly holds data.",
    syntax: "from dataclasses import dataclass\n@dataclass\nclass Name:\n    field: type",
    examples: [{ code: "from dataclasses import dataclass\n\n@dataclass\nclass Point:\n    x: int\n    y: int\n\np = Point(1, 2)\nprint(p)   # Point(x=1, y=2)", note: "Less boilerplate for simple data-holding classes." }],
    related: ["init", "class", "type-hints"],
  },

  // ---------- Errors & exceptions ----------
  {
    slug: "try-except", name: "try / except / finally", category: "Errors & exceptions",
    summary: "Catch and handle errors so the program does not crash.",
    syntax: "try:\n    ...\nexcept SomeError:\n    ...\nelse:\n    ...\nfinally:\n    ...",
    examples: [{ code: "try:\n    n = int('abc')\nexcept ValueError:\n    print('not a number')\nfinally:\n    print('done')", note: "except handles a specific error; else runs if none occurred; finally always runs." }],
    related: ["raise", "custom-exceptions"],
  },
  {
    slug: "raise", name: "raise", category: "Errors & exceptions",
    summary: "Signal an error yourself when something is wrong.",
    syntax: "raise ErrorType('message')",
    examples: [{ code: "def withdraw(balance, amount):\n    if amount > balance:\n        raise ValueError('insufficient funds')\n    return balance - amount", note: "Raise a clear error instead of returning a bad value silently." }],
    related: ["try-except", "custom-exceptions"],
  },
  {
    slug: "custom-exceptions", name: "Custom exceptions", category: "Errors & exceptions",
    summary: "Define your own error type by subclassing Exception.",
    syntax: "class MyError(Exception):\n    pass",
    examples: [{ code: "class OutOfStock(Exception):\n    pass\n\nraise OutOfStock('sold out')", note: "A named error is easier to catch and understand than a generic one." }],
    related: ["raise", "try-except", "inheritance"],
  },
  {
    slug: "context-manager", name: "with (context manager)", category: "Errors & exceptions",
    summary: "Guarantee setup and cleanup (like closing a file) even if an error happens.",
    syntax: "with resource as name:\n    ...",
    examples: [{ code: "with open('notes.txt') as f:\n    data = f.read()\n# the file is closed automatically here", note: "The with block closes the file for you, even if the code inside raises an error." }],
    related: ["open-files", "try-except"],
  },

  // ---------- Modules & files ----------
  {
    slug: "import", name: "import", category: "Modules & files",
    summary: "Use code from Python's standard library or other files.",
    syntax: "import module\nfrom module import name",
    examples: [{ code: "import math\nprint(math.sqrt(16))    # 4.0\n\nfrom random import choice\nprint(choice([1, 2, 3]))", note: "import brings in the whole module; from ... import brings in specific names." }],
    related: ["pip-venv", "json-module"],
  },
  {
    slug: "pip-venv", name: "pip & virtual environments", category: "Modules & files",
    summary: "Install outside packages, and keep each project's packages separate.",
    syntax: "python -m venv .venv\npip install requests",
    examples: [{ code: "# in a terminal, not in Python\npython -m venv .venv\nsource .venv/bin/activate\npip install requests", note: "A virtual environment (venv) isolates a project's packages so they do not clash with other projects." }],
    related: ["import"],
  },
  {
    slug: "open-files", name: "Reading & writing files", category: "Modules & files",
    summary: "Open a file to read or write, ideally with a with block.",
    syntax: "with open(path, mode) as f:\n    ...",
    examples: [{ code: "with open('out.txt', 'w') as f:\n    f.write('hello')\n\nwith open('out.txt') as f:\n    print(f.read())   # hello", note: "Modes: 'r' read, 'w' write (overwrite), 'a' append. with closes the file automatically." }],
    related: ["context-manager", "json-module"],
  },
  {
    slug: "json-module", name: "json module", category: "Modules & files",
    summary: "Convert between Python objects and JSON text.",
    syntax: "json.dumps(obj)   json.loads(text)",
    examples: [{ code: "import json\nuser = {'name': 'Priya', 'age': 27}\ntext = json.dumps(user)     # dict -> JSON text\nback = json.loads(text)     # JSON text -> dict\nprint(back['name'])         # Priya", note: "dumps = dump to string; loads = load from string." }],
    related: ["import", "dict"],
  },

  // ---------- Advanced ----------
  {
    slug: "decorator", name: "Decorator", category: "Advanced",
    summary: "A function that wraps another function to add behaviour, using @name.",
    syntax: "@decorator\ndef func():\n    ...",
    examples: [{ code: "from functools import wraps\n\ndef shout(fn):\n    @wraps(fn)\n    def inner(*a, **k):\n        return fn(*a, **k).upper()\n    return inner\n\n@shout\ndef greet(name):\n    return f'hi {name}'\n\nprint(greet('priya'))   # HI PRIYA", note: "@shout replaces greet with a wrapped version. @wraps keeps the original name and docstring." }],
    related: ["closure", "def"],
  },
  {
    slug: "closure", name: "Closure", category: "Advanced",
    summary: "An inner function that remembers variables from the function that made it.",
    syntax: "def outer(x):\n    def inner():\n        return x\n    return inner",
    examples: [{ code: "def multiplier(factor):\n    def times(n):\n        return n * factor\n    return times\n\ndouble = multiplier(2)\nprint(double(5))   # 10", note: "times remembers factor even after multiplier has finished. Closures power decorators." }],
    related: ["decorator", "scope"],
  },
  {
    slug: "gil", name: "The GIL", category: "Advanced",
    summary: "A lock in standard Python that lets only one thread run Python code at a time.",
    detail: [
      "The Global Interpreter Lock (GIL) means threads do not run Python code truly in parallel, so threads do not speed up CPU-heavy work.",
      "Use threads (or async) for input/output work that spends time waiting, and use multiprocessing (separate processes) for heavy calculation.",
    ],
    related: ["threading-multiprocessing", "async-await"],
  },
  {
    slug: "threading-multiprocessing", name: "threading vs multiprocessing", category: "Advanced",
    summary: "Two ways to do more than one thing at once, for different kinds of work.",
    detail: [
      "threading runs tasks concurrently in one process; because of the GIL it helps with input/output-bound work (network, disk), not heavy computation.",
      "multiprocessing runs tasks in separate processes with their own memory, giving true parallelism for CPU-heavy work.",
    ],
    related: ["gil", "async-await"],
  },
  {
    slug: "async-await", name: "async / await", category: "Advanced",
    summary: "Run many waiting tasks (like network calls) at once in a single thread.",
    syntax: "async def f():\n    await something()",
    examples: [{ code: "import asyncio\n\nasync def main():\n    await asyncio.sleep(1)\n    print('done')\n\nasyncio.run(main())", note: "await pauses one task while it waits, letting others run. Great for lots of input/output, not for CPU-heavy work." }],
    related: ["gil", "threading-multiprocessing"],
  },
  {
    slug: "type-hints", name: "Type hints", category: "Advanced",
    summary: "Optional annotations that say what type a variable or parameter should be.",
    syntax: "def f(x: int) -> str:\n    ...",
    examples: [{ code: "def greet(name: str, times: int = 1) -> str:\n    return f'hi {name} ' * times", note: "Python does not enforce these at run time; tools like mypy and your editor use them to catch mistakes." }],
    related: ["def", "dataclass"],
  },
];

export const bySlug = Object.fromEntries(entries.map((e) => [e.slug, e]));
