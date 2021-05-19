import { makeBlobString, makePureBlobString } from "./core";

function getCleanLines(x: string) {
  return x
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

test("makeBlobString", () => {
  const workerFunction = () => {
    const bar = 42;
    console.log("foo");
    return bar;
  };

  const result = makeBlobString(workerFunction);

  const expectation = `
    function setOnMessage(messageHandler) {
      self.onmessage = messageHandler;
    }

    (() => {
      const bar = 42;
      console.log("foo");
      return bar;
    })(self.postMessage, setOnMessage);
  `;

  expect(getCleanLines(result)).toStrictEqual(getCleanLines(expectation));
});

test("makePureBlobString", () => {
  const pureFunction = function () {
    return 42;
  };

  const result = makePureBlobString(pureFunction);
  const expectation = `
    onmessage = (msg) => {
      postMessage((function () {
        return 42;
      })(...msg.data[0]), msg.data[1]);
    };
  `;

  expect(getCleanLines(result)).toStrictEqual(getCleanLines(expectation));
});
