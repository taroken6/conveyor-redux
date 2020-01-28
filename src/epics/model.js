import * as Actions from '../actions'
import * as consts from '../actionConsts'
import * as R from 'ramda'
import { getFilters, getSort } from '../utils/Getters'
import { map, mergeMap } from 'rxjs/operators'
import { ofType } from 'redux-observable'
import { selectTableView } from '../reducers/tableView'

export const generateFetchModelIndexEpic = (schema, doRequest) => (
  action$,
  state$
) =>
  action$.pipe(
    ofType(consts.FETCH_MODEL_INDEX),
    map(R.prop('payload')),
    map(payload => {
      const variables = {
        filter: getFilters({
          schema,
          modelName: payload.modelName,
          tableView: selectTableView(state$.value)
        }),
        sort: getSort({
          schema,
          modelName: payload.modelName,
          tableView: selectTableView(state$.value)
        })
      }
      return { modelName: payload.modelName, variables }
    }),
    mergeMap(context => {
      const query = doRequest.buildQuery(context.modelName, 'index')
      return doRequest
        .sendRequest(query, context.variables)
        .then(({ data, error }) => ({ context, data, error }))
    }),
    map(({ context, data, error }) => {
      if (error) {
        return Actions.errorLogger({
          message: `Error loading ${context.modelName} index.`
        })
      }
      return Actions.updateModelIndex({ modelName: context.modelName, data })
    })
  )

export const generateFetchModelDetailEpic = (schema, doRequest) => (
  action$,
  state$
) =>
  action$.pipe(
    ofType(consts.FETCH_MODEL_DETAIL),
    map(R.prop('payload')),
    map(payload => {
      const variables = { id: payload.id }
      return { modelName: payload.modelName, id: payload.id, variables }
    }),
    mergeMap(context => {
      const query = doRequest.buildQuery(context.modelName, 'detail')
      return doRequest
        .sendRequest(query, context.variables)
        .then(({ data, error }) => ({ context, data, error }))
    }),
    map(({ context, data, error }) => {
      if (error) {
        return Actions.errorLogger({
          message: `Error loading ${context.modelName} details.`
        })
      }
      return Actions.updateModelDetail({
        modelName: context.modelName,
        id: context.id,
        data
      })
    })
  )
