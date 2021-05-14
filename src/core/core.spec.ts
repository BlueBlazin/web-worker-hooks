import {
  makeBlobString,
  makeImportDeclarations,
  makeImportsObj,
  makePureBlobString,
} from "./core";

function getCleanLines(x: string) {
  return x
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

describe("makeImportsDeclarations", () => {
  test("multiple imports", () => {
    const imports = {
      Example: "example",
      baz: "@foo/bar",
    };

    const result = makeImportDeclarations(imports);
    const expectation = `
      import * as Example from "example";
      import * as baz from "@foo/bar";
    `;

    expect(getCleanLines(result)).toStrictEqual(getCleanLines(expectation));
  });
});

describe("makeImportsObj", () => {
  test("multiple imports", () => {
    const imports = {
      abc: "abc",
      catDog: "@cat/dog",
    };

    const result = makeImportsObj(imports);
    const expectation = `const importsObj = {
      "abc": abc,
      "catDog": catDog
    };`;

    expect(getCleanLines(result)).toStrictEqual(getCleanLines(expectation));
  });

  test("single import", () => {
    const imports = { abc: "abc" };

    const result = makeImportsObj(imports);
    const expectation = `const importsObj = {
      "abc": abc
    };`;

    expect(getCleanLines(result)).toStrictEqual(getCleanLines(expectation));
  });

  test("no imports", () => {
    const imports = {};

    const result = makeImportsObj(imports);
    const expectation = `const importsObj = {
    };`;

    expect(getCleanLines(result)).toStrictEqual(getCleanLines(expectation));
  });
});

test("makeBlobString", () => {
  // makeBlobString(importDclrs: string, importsObj: string, workerFunction: WorkerFunction)
  const imports = {
    hello: "hello",
    World: "hello/world",
  };

  const workerFunction = () => {
    const bar = 42;
    console.log("foo");
    return bar;
  };

  const importDclrs = makeImportDeclarations(imports);
  const importsObj = makeImportsObj(imports);
  const result = makeBlobString(importDclrs, importsObj, workerFunction);

  const expectation = `
    import * as hello from "hello";
    import * as World from "hello/world";

    const importsObj = {
      "hello": hello,
      "World": World
    };

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
  const pureFunction = function (args) {
    return 42;
  };

  const result = makePureBlobString(pureFunction);
  const expectation = `
    onmessage = (msg) => {
      postMessage((function (args) {
        return 42;
      })(...msg.data));
    };
  `;

  expect(getCleanLines(result)).toStrictEqual(getCleanLines(expectation));
});
