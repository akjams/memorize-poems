(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))a(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const n of t.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&a(n)}).observe(document,{childList:!0,subtree:!0});function s(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function a(e){if(e.ep)return;e.ep=!0;const t=s(e);fetch(e.href,t)}})();const i=document.querySelector("#poemInput"),l=document.querySelector("#poemForm"),c=document.querySelector("#printable"),u=document.querySelector("#poemGrid");function d(o){u.innerHTML="";const r=o.split(`
`);for(const s of r){const a=s.trim().split(/\s+/),e=document.createElement("div");e.className="poemLine poemText",e.textContent=s;const t=document.createElement("div");t.className="poemLine hintText",t.textContent=a.map(n=>n.toLowerCase()[0]??"").join(" "),u.append(e,t)}c.style.display="block"}i.value=`If we didn’t have birthdays, you wouldn’t be you.
If you’d never been born, well then what would you do?
If you’d never been born, well then what would you be?
You might be a fish! Or a toad in a tree!

You might be a doorknob! Or three baked potatoes!
You might be a bag full of hard green tomatoes.
Or worse than all that… Why, you might be a WASN’T!
A Wasn’t has no fun at all. No, he doesn’t.
A Wasn’t just isn’t. He just isn’t present.
But you…You ARE YOU! And, now isn’t that pleasant!

Today you are you! That is truer than true!
There is no one alive who is you-er than you!
Shout loud, “I am lucky to be what I am!
Thank goodness I’m not just a clam or a ham
Or a dusty old jar of sour gooseberry jam!
I am what I am! That’s a great thing to be!
If I say so myself, HAPPY BIRTHDAY TO ME!"
`;l.addEventListener("submit",o=>{o.preventDefault();const r=i.value.trim();d(r)});i.addEventListener("keydown",o=>{o.key==="Enter"&&o.ctrlKey&&(o.preventDefault(),l.requestSubmit())});
