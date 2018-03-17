import {
    debounce,
} from 'lodash';

const warningIcon = '<i class="circular inverted red exclamation triangle icon"></i>';
const suggestionIcon = '<i class="circular inverted blue pencil alternate icon"></i>';

function setWarning(warning: string) {
    const element = document.querySelector<HTMLParagraphElement>('.password-strength .warning');

    if (element) {
        if (warning.length > 0) {
            element.innerHTML = `${warningIcon} ${warning}`;
            element.classList.remove('hidden');
        } else {
            element.innerHTML = '';
            element.classList.add('hidden');
        }
    }
}

function showSuggestions(suggestions: string[]) {
    const elements = suggestions.map(item => {
        const element = document.createElement('li');
        element.innerHTML = `${suggestionIcon} ${item}`;
        return element;
    })

    const host = document.querySelector('.password-strength .suggestions');

    if (host) {
        if (host.childNodes.length > 0) {
            let index = host.childNodes.length - 1;
            while (index >= 0) {
                const element = host.childNodes[index];
                host.removeChild(element);
                index--;
            }
        }

        for (const element of elements) {
            host.appendChild(element);
        }

        if (elements.length > 0) {
            host.classList.remove('hidden');
        } else {
            host.classList.add('hidden');
        }
    }
}

async function OnPasswordInput(this: HTMLInputElement, ev: Event) {
    const password = this.value;
    if (password.length === 0) {
        const element = document.querySelector<HTMLDivElement>('.password-strength');

        if (element) {
            element.classList.add('hidden');
        }

        return;
    } else {
        const element = document.querySelector<HTMLDivElement>('.password-strength');

        if (element) {
            element.classList.remove('hidden');
        }
    }
    const response = await fetch('password/strength', {
        method: 'POST',
        body: JSON.stringify({
            password,
        }),
        headers: {
            'content-type': 'application/json',
        },
    });

    const data = await response.json();

    const progress = document.querySelector('.password-strength .progress');
    if (progress) {
        const bar = progress.children[0];

        if (bar) {
            const width = ((data.score + 1) / 5) * 100;
            bar.setAttribute('style', `width: ${width}%;`);
        }

        progress.classList.remove('red', 'yellow', 'green');

        if (data.score <= 2) {
            progress.classList.add('red');
        } else if (data.score === 3) {
            progress.classList.add('yellow');
        } else {
            progress.classList.add('green');
        }

        if (data.feedback && (typeof data.feedback.warning === 'string')) {
            setWarning(data.feedback.warning);
        }

        if (data.feedback && (Array.isArray(data.feedback.suggestions))) {
            showSuggestions(data.feedback.suggestions);
        }
    }

}

const OnPasswordInputDebounced = debounce(OnPasswordInput, 500);

function onReady() {
    const passwordBox = document.querySelector<HTMLInputElement>('input[name="password"]');

    if (passwordBox) {
        passwordBox.addEventListener("input", OnPasswordInputDebounced);
    }
}

document.addEventListener("DOMContentLoaded", onReady);
