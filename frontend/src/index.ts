import {
    debounce,
} from 'lodash';

const warningIcon = '<i class="circular inverted yellow exclamation triangle icon"></i>';

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
        element.innerText = item;
        return element;
    })

    const host = document.querySelector('.password-strength .suggestions');

    if (host) {
        if (host.childNodes.length > 0) {
            for (let index = 0; index < host.childNodes.length; index++) {
                const element = host.childNodes[index];
                host.removeChild(element);
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
    const response = await fetch('/password/strength', {
        method: 'POST',
        body: JSON.stringify({
            password,
        }),
        headers: {
            'content-type': 'application/json',
        },
    });

    const data = await response.json();

    const $element = $('.password-strength .progress') as any;

    $element.progress('set progress', data.score);

    $element.removeClass('red yellow green');

    if (data.score <= 2) {
        $element.addClass('red');
    } else if (data.score === 3) {
        $element.addClass('yellow');
    } else {
        $element.addClass('green');
    }

    if (data.feedback && (typeof data.feedback.warning === 'string')) {
        setWarning(data.feedback.warning);
    }

    if (data.feedback && (Array.isArray(data.feedback.suggestions))) {
        showSuggestions(data.feedback.suggestions);
    }

    console.log(data);

}

const OnPasswordInputDebounced = debounce(OnPasswordInput, 500);

function onReady() {
    const element = document.querySelector<HTMLDivElement>('.password-strength.hidden');

    if (element) {
        element.classList.remove('hidden');
    }

    const progress = document.querySelector<HTMLDivElement>('.password-strength .progress');

    if (progress) {
        const $progress = $(progress) as any;
        $progress.progress();
    }

    const passwordBox = document.querySelector<HTMLInputElement>('input[name="password"]');

    if (passwordBox) {
        passwordBox.addEventListener("input", OnPasswordInputDebounced);
    }
}

document.addEventListener("DOMContentLoaded", onReady);
