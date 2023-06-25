# Task 3

## Form validation

- changed design: desks are now always displayed
- validated inputs with the RegExp object
    - for some reason it didn't work when checking if the student ID only contains numbers
    - directly entering the regular expression and testing that (`/^\d+$/.test(id)`) worked, don't know hy

## Sending the booking request

- the POST request to `https://matthiasbaldauf.com/wbdg23/booking` doesn't seem to work
    - always responds with `"parameter <deskid> missing"`, both inside of the tool, and when testing the API with [Postman](https://web.postman.co/)
    - ![](error.png)
    - ![](error2.png)
    - Solution: Send data as [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData/Using_FormData_Objects) instead of json parameters

## Save user data locally

- Saving and loading the data was very easy with the [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) function.
  - Load the save value at startup with the `localStorage.getItem()` function, set a default value if it's `null`
  - Save the value to localStorage with `localStorage.getItem()` if the booking is successful