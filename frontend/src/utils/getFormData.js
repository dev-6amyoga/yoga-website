// get form data from the event object
export default function getFormData(e) {
    return Object.fromEntries(new FormData(e.target).entries());
}
