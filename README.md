# chanspy

chanspy is a [Hubot][hubot] implementation for funsies and definitely not profit.

[hubot]: http://hubot.github.com

### Configuration

```bash
cp .env.sample .env
chmod 600 .env
```

Edit `.env` as needed.

### Setting up a container

If you don't want to worry about using a local node installation, you can create a rootless container to run chanspy in:

```bash
podman run -it --rm --name chanspy-dev -v "$HOME/src/git/chanspy":/home/node/chanspy:Z -w /home/node/chanspy --userns=keep-id node:15.1.0 /bin/bash
```

The above assumes the following:

1. You have a chanspy checkout located at `$HOME/src/git/chanspy`.
1. Your user ID is 1000 (the node user's ID in the container is also 1000, and it's useful for the IDs to match if you want to use an editor outside of the container).

If you don't have podman, this setup can easily be adapted to docker.

### Running chanspy

You can start chanspy with the shell adapter by running:

```bash
bin/hubot
```

Or you can start chanspy with the irc adapter by running:

```bash
bin/hubot -a irc
```

You can then ask chanspy for help:

```
chanspy: help
```

The colon is optional.

### Scripting

To get started, read the [hubot scripting guide][scripting-docs] and see existing examples in the `scripts/` directory. General library code is currently going into the `lib/` directory.

[scripting-docs]: https://github.com/github/hubot/blob/master/docs/scripting.md

### external-scripts

There will inevitably be functionality that everyone will want. Instead of writing it yourself, you can use existing plugins.

Hubot is able to load plugins from third-party `npm` packages. This is the recommended way to add functionality to your hubot. You can get a list of available hubot plugins on [npmjs.com][npmjs] or by using `npm search`:

```bash
npm search hubot-scripts panda
```

To use a package, check the package's documentation, but in general it is:

1. Use `npm install --save` to add the package to `package.json` and install it.
1. Add the package name to `external-scripts.json` as a double quoted string.

##### Advanced Usage

It is also possible to define `external-scripts.json` as an object to explicitly specify which scripts from a package should be included. The example below, for example, will only activate two of the six available scripts inside the `hubot-fun` plugin, but all four of those in `hubot-auto-deploy`.

```json
{
  "hubot-fun": [
    "crazy",
    "thanks"
  ],
  "hubot-auto-deploy": "*"
}
```

**Be aware that not all plugins support this usage and will typically fallback
to including all scripts.**

[npmjs]: https://www.npmjs.com
