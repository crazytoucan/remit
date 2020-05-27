/**
 * Variant of the standard Flux Standard Action type used by Tinysaga.
 * When an Action is given to an Emitter, the handlers of the given `type`
 * will be called with the action's `payload`.
 *
 * For constructing Actions to use with Tinysaga, prefer using ActionDefinitions
 * created with `defineAction()`.
 */
export interface IAction {
  /**
   * Type of the action, like "ReloadUsers"
   */
  type: string;

  /**
   * The payload associated with this action.
   */
  payload: any;
}

/**
 * This class is a typesafe wrapper for creating Actions. Using `defineAction()`, consumers can
 * create typesafe paylods by invoking the definition as a function.
 *
 * ```
 * const LoadUser = defineAction<{ id: string }>("LoadUser");
 * // the following line is typesafe
 * dispatch(LoadUser({ id: "4" }));
 * ```
 */
export type IActionDefinition<T> = {
  /**
   * The Action type string, used for registering handlers via Emitter.on()
   */
  TYPE: IActionType<T>;

  /**
   * Convenience TypeScript type for higher order type arithmetic
   */
  __payload: T;

  /**
   * Constructs an instance of this Action using the definition's `type` and this `payload`
   */
  (payload: T): { type: string; payload: T };
} & (T extends undefined
  ? {
      (): { type: string; payload: undefined };
    }
  : {});

export type IActionType<T> = string & {
  __payload: T;
};

/**
 * An event bus in Tinysaga which accepts `{ type, payload }` Actions
 * and invokes all listeners of the given `type` with the `payload`.
 *
 * Note: The Tinysaga emitter operates as a _strict_ event queue, which means
 * emitting Actions from a previous listener being called will *enqueue the action for
 * later processing*, rather than allowing reentrant action loop processing.
 *
 * This design choice was made specifically to avoid two different listeners seeing the same
 * events in different orders. If your workflow requires reentrant event processing, consider rewriting your code
 * to not rely on the special ordering or managing your own eventing structure for those needs.
 *
 * For constructing an emitter, use the Emitter class.
 */
export interface IEmitter {
  /**
   * Emits a new Action onto this emitter. If the emitter is already notifying listeners
   * of a previous Action, this followup `action` will be added to a queue for later processing.
   *
   * @param action the action to emit
   */
  put(action: IAction): void;

  /**
   * Listens for Actions of a given Type to enter the emitter, invoking the given callback
   * with the Action's payload. Returns a cleanup function that, when called, will stop
   * notifying the handler of further Actions, similar to Store.subscribe() in Redux.
   *
   * @param type
   * @param handler
   */
  on<T>(type: IActionType<T>, handler: (payload: T) => void): () => void;
}

/**
 * A Store type included with Tinysaga. This Store can be handed directly to React-Redux
 * and will completely replace the Redux needs of some applications.
 *
 * For constructing a store, use the Store class.
 */
export interface IStore<S> {
  /**
   * Ths state of the store. Applications should feel free to reference this value directly,
   * rather than using getState().
   */
  readonly state: S;

  /**
   * The state of the store as a getter function, required for React-Redux integration.
   */
  getState(): S;

  /**
   * Directly sets the new state of the store. If this state reference is different from the old one,
   * listeners will be notified on the next tick. If you'd like to notify listeners sooner (e.g. to
   * _synchronously_ repaint your UI), use store.flush() immediately after store.setState().
   */
  setState(nextState: S): void;

  /**
   * Subscribes to changes from this store, required for React-Redux integrations. Applications
   * should generally not need to subscribe() to the Store, preferring instead to handle
   * update logic as part of their Emitter handler logic.
   *
   * @param cb
   */
  subscribe(cb: () => void): () => void;

  /**
   * Flushes any pending listener notifications synchronously, rather than waiting until the next tick.
   * The default behavior to wait a tick is to prevent multiple synchronous repaints to the same Redux tree,
   * e.g. if two different handlers for an Action both wrote to the same Store.
   */
  flush(): void;
}
