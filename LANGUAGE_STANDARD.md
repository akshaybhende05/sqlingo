# Plain-English standard (canonical — read this before editing any chapter, in any course)

This file is the single source of truth for how chapter body text must read,
across every course on the site (SQL, Python, Django, FastAPI, DevOps,
Business Analyst, QA, Development Fundamentals, Capstone). It replaces all
earlier informal notes on "plain voice." Read it in full before writing or
editing any chapter. Do not rely on memory of it from an earlier session or
an earlier chapter. Re-read this file every time.

The rules below are not SQL-specific. "SQL" appears in some examples only
because that is the course being worked on first. The same rules apply
word-for-word when writing Python, Django, FastAPI, DevOps, BA, QA, Dev
Fundamentals, or Capstone chapters.

## The goal

Write for a common Indian software developer who understands programming
better than English.

The reader:

* Is a non-native English speaker.
* Has basic to intermediate English skills.
* Can understand technical concepts if they are explained clearly.
* Should not need a dictionary to read the chapter.

## The test

Before keeping any sentence, ask:

Would a common Indian English speaker, reading this for the first time,
understand the exact meaning on the first read, without having to re-read
the sentence or mentally translate difficult English into simpler English?

If the honest answer is no, rewrite the sentence.

## The rules

1. **State the fact first.** The first sentence should explain what the
   concept is or what it does. Do not begin with an analogy, a story, a
   rhetorical question, or scene-setting.

   Example:
   - Good: SQL is used to read data and change data.
   - Bad: Imagine a huge library...
   - Good (Python): A variable stores a value so you can use it later.
   - Bad (Python): Think of a variable as a labeled box on a shelf...

2. **Use textbook English.** Write like a teacher explaining a topic. Do not
   write like a novelist, a blogger, a marketer, or a public speaker. Avoid
   decorative writing. Banned words and phrases: genuinely, quietly, neat
   grid, boil it down, worth the stretch, honest truth, and close variations
   of these.

3. **Prefer clarity over variety.** Repeat important technical nouns whenever
   repeating the noun improves clarity.

   Good: "Reading data is safe. Reading data does not change the database."
   Worse: "Reading data is safe. It does not change anything."

   Do not repeat a noun mechanically if it makes the sentence awkward.

4. **Explain new technical words immediately.** Never explain one unknown
   word using another unknown word.

   Bad: "A process is managed by the scheduler."
   Good: "A process is a running program. The operating system decides when
   each process runs."

   After introducing a term once, continue using that term normally.

5. **One new idea at a time.** Each sentence should introduce only one new
   idea.

   Bad: "SQL reads data, changes data, creates tables, manages users, and
   controls permissions."
   Good: "SQL reads data. SQL also changes data. Later, you will learn how
   SQL creates tables. You will also learn how SQL manages users."

6. **Keep sentences short.** Aim for about 10 to 20 words per sentence. If a
   sentence becomes longer than about 25 words, split it into two or more
   sentences. Never combine multiple ideas just to make the writing shorter.

7. **Keep paragraphs short.** Most paragraphs should contain 2 to 4
   sentences. Start a new paragraph whenever the explanation changes to a
   new idea. Large paragraphs make the content harder to read.

8. **Avoid decorative metaphor.** Describe what something does. Do not
   describe it as if it were alive. Do not write: lives in, sits on, talks
   to, stitches together, glues together, follows a thread, backbone,
   skeleton, heart of, under the hood, behind the scenes, comes alive, dive
   into, dig into.

   Literal visual descriptions are fine.
   Example: "A database table looks similar to an Excel sheet." This
   describes appearance, not behavior.

9. **Keep analogies separate.** An analogy is optional. An analogy is never
   the main explanation. Always explain the concept first. If the project
   already has an `analogy` box, keep it after the explanation. Do not add
   new analogies inside the main body text.

10. **Use active voice.** Prefer "The database returns the data" over "The
    data is returned by the database." Active voice is usually easier to
    understand.

11. **Explain in the order things happen.** Explain events in chronological
    order whenever possible.

    Good: "The browser sends a request. The server receives the request. The
    server processes the request. The server sends a response."

    Avoid explaining the result before the cause.

12. **Do not assume prior knowledge.** Every chapter should be understandable
    on its own. If a new technical word appears for the first time, explain
    it. Do not assume the reader already knows words such as: row, column,
    request, response, process, thread, schema, socket. Explain the word
    before using it repeatedly.

13. **Prefer common English words.** Choose the simplest word that keeps the
    technical meaning correct. Prefer: use (not utilize), get (not obtain),
    show (not display), change (not modify), start (not initiate), find (not
    locate), save (not persist, unless persistence is the topic itself).

    Do not replace technical terms that are part of the topic: SQL, HTTP,
    API, DNS, RAM, CPU, process, thread, database, and course-specific terms
    like these (queryset, middleware, coroutine, container, and so on, for
    the other courses).

14. **Never give books or chapters human actions.** Books and chapters do not
    perform actions. Avoid: "this handbook spends...", "this course teaches
    itself...", "this chapter walks you through...". Prefer: "the first few
    chapters cover...", "this chapter explains...", "later chapters
    introduce...".

15. **No em dashes.** Do not use an em dash anywhere. Use a period, a comma,
    or a colon instead. This is a hard rule.

16. **Use examples only when they improve understanding.** Do not add
    examples automatically. If a concept is already clear, no example is
    needed. If an example is useful, make it realistic and short.

17. **Follow this teaching pattern** whenever introducing a new concept:
    1. Explain what it is.
    2. Explain what it does.
    3. Explain why it is needed.
    4. Show a small example.
    5. Add an analogy only if it improves understanding.

## Reference examples

SQL:

> SQL is mainly used for two types of tasks: reading data and changing data.
> Reading data means getting information from the database. Changing data
> means adding new data, updating existing data, or deleting data.
>
> Most people start by learning how to read data because it is safe. Reading
> data does not change the database, so you cannot accidentally break
> anything. It is also the task you will perform most of the time.
>
> In this handbook, the first few chapters focus only on reading data. Once
> you are comfortable writing and understanding read queries, you will learn
> how to change data.

Python (a non-SQL example, to show the same rules apply to every course):

> A variable stores a value so your program can use it later. You give the
> variable a name, and you give it a value. Later in the program, you use
> the name to get the value back.
>
> Python decides the type of a variable from the value you give it. If you
> store a number, the variable holds a number. If you store text, the
> variable holds text. You do not have to declare the type yourself.

Both examples demonstrate: short sentences, repeated technical nouns, common
English words, active voice, one idea per sentence, no unnecessary analogy,
no metaphor, no em dash.

## Grep sweep (a final check, not the editing method)

The grep sweep below is a safety net to run after rewriting a chapter by
hand. It catches leftover banned words and em dashes. It does **not** catch
run-on sentences, long paragraphs, unexplained jargon, passive voice, or
prose that just reads stiffly. Those can only be caught by actually reading
the chapter, sentence by sentence, against rules 1 to 17. Do not treat a
clean grep sweep as proof that a chapter is done.

Metaphor and decorative language:
```
lives in|sits (on|behind|inside)|talks? to|talking to|stitch|glue|thread|
backbone|spine|skeleton|second nature|heart of it|at the heart of|under the
hood|behind the scenes|comes alive|dive into|dig into|wear.{0,10}hat|juggl
```

Em dash:
```
—|&mdash;
```
Must return zero matches.

Banned flourish words:
```
genuinely|quietly|neat grid|boil it down|worth the stretch|honest truth
```
Must return zero matches.

## Process for every chapter

1. Read this file.
2. Read the chapter's full source text in the relevant engine file (see
   the file map below). Read the whole chapter, not just the first
   paragraph.
3. Rewrite every sentence that fails the readability test: check actual
   word count per sentence, actual sentence count per paragraph, whether
   jargon is explained on first use, whether voice is active, whether the
   explanation order is chronological. This is a close read, not a
   keyword search.
4. Keep existing `analogy` boxes unless they themselves violate these rules.
5. Run the grep sweep against the chapter as a safety net.
6. Fix every match until zero remain.
7. Run `node --check <file>` then `node scripts/extract-content.js <course>`
   to regenerate the reading-page JSON.
8. Re-read the finished chapter start to finish and confirm it reads
   naturally, the way a plain textbook would, not just that it passes the
   grep sweep.

## File map (per course)

| Course | Engine file | Extract command |
|---|---|---|
| SQL | `public/app.js` | `node scripts/extract-content.js sql` |
| Python | `public/python.js` | `node scripts/extract-content.js dev-python` |
| Django | `public/django.js` | `node scripts/extract-content.js dev-django` |
| FastAPI | `public/fastapi.js` | `node scripts/extract-content.js dev-fastapi` |
| DevOps | `public/devops.js` | `node scripts/extract-content.js dev-devops` |
| Business Analyst | `public/ba.js` | `node scripts/extract-content.js business-analyst` |
| QA | `public/qa.js` | `node scripts/extract-content.js qa` |
| Development Fundamentals | `public/devfund.js` | `node scripts/extract-content.js dev-fundamentals` |
| Capstone | `public/capstone.js` | `node scripts/extract-content.js dev-capstone` |

## Status

### SQL (`public/app.js`) — pilot, in progress
Done: `00`, `0i`, `0b`, `01`-`14`, `15` (Subqueries), `16` (Window functions).
Remaining, in order: `17`, `18`, `18b`, `19`, `20`, `21`, `22`, `23`, `24`,
`25`, `26`.

### Python, Django, FastAPI, DevOps, Business Analyst, QA, Development Fundamentals, Capstone
Not started. Work through these in this order, after SQL is fully done and
passes both the close-read process and the grep sweep with zero matches.

Landing page hero/card copy is a separate pass, held until asked for.
