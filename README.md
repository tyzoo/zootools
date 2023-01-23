## SDK Library

zootools is a library to help speed up SDK development of Decentraland scenes.

## Install

To use any of the helpers provided by this library:

1. Install the dependencies as an npm package. Run this command in your scene's project folder:

   ```
   npm install dcldash@latest zootools@latest -B
   ```

2. Make sure tsconfig.json is properly set up. Also see [tsconfig.json example](https://tyzoo.github.io/assets/json/tsconfig.json)

   ```json
      {
      "compilerOptions": {
         "outFile": "./bin/game.js",
         "allowJs": true,
         "strict": true,
         "noLib": false,
         "paths": {
            "dcldash": [
               "node_modules\\dcldash\\dist\\index.d.ts",
               "node_modules/dcldash/dist/index.d.ts",
               "./node_modules/dcldash/dist/index.d.ts",
            ],
            "zootools": [
               "node_modules\\zootools\\dist\\index.d.ts",
               "node_modules/zootools/dist/index.d.ts",
               "./node_modules/zootools/dist/index.d.ts",
            ]
         },
         "baseUrl": "."
      },
      "include": [
         "src/**/*.ts"
      ],
      "extends": "./node_modules/decentraland-ecs/types/tsconfig.json",
      "compileOnSave": false
      }
   ```

3. Add this line at the start of your game.ts file:

   ```ts
   import { AlertSystem } from 'zootools';

   const alertSystem = new AlertSystem();

   alertSystem.new(`hello world`, 30000);

   ```


## Usage

### Reward Tools Decentraland POAP Booth
Spawn a Decentraland POAP booth compatible with [https://reward.tools](https://reward.tools)

   ```ts
   import { RTPOAPBooth, AlertSystem } from "zootools";
   const alertSystem = new AlertSystem()
   const poapBooth = new RTPOAPBooth(
      {
         transformArgs: {
               position: new Vector3(4,0,4),
         },
      },
      alertSystem,
      // "rewardMongoId", //set rewardId here
   )
   poapBooth.setRewardId("rewardMongoId"); // or here
   engine.addEntity(poapBooth);

   ```

Be sure to add the [poap_assets](https://github.com/tyzoo/tyzoo.github.io/tree/master/assets/poap_assets) folder to the root of your scene

### < Docs coming soon >

## Copyright info

This scene is protected with a standard Apache 2 licence. See the terms and conditions in the [LICENSE](/LICENSE) file.
