'use strict';

const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const config = require('config').get('constructionProjectApp');
const winston = require('winston');
const LOG = winston.loggers.get('application');

const participantId = config.get('participantId');
const participantPwd = config.get('participantPwd');

class App {
    constructor() {
        this.bizNetworkConnection = new BusinessNetworkConnection();
        this.CONNECTION_PROFILE_NAME = config.get('connectionProfile');
        this.businessNetworkIdentifier = config.get('businessNetworkIdentifier');
    }

    init() {
        return this.bizNetworkConnection.connect(this.CONNECTION_PROFILE_NAME, this.businessNetworkIdentifier, participantId, participantPwd)
            .then((result) => {
                this.businessNetworkDefinition = result;
                LOG.info('ProjectRegistry:<init>', 'businessNetworkDefinition obtained', this.businessNetworkDefinition.getIdentifier());
            })
            // and catch any exceptions that are triggered
            .catch(function (error) {
                throw error;
            });
    }

    bootstrap() {
        LOG.info('ProjectRegistry:_bootstrap', 'getting asset registry for "org.acme.project.bidding.Project"');
        let factory = this.businessNetworkDefinition.getFactory();;
        let owner;
        return this.bizNetworkConnection.getAssetRegistry('org.acme.project.bidding.Project')
            .then((projectsRegistry) => {
                LOG.info('ProjectRegistry:_bootstrap', 'getting factory and adding assets');
                
                LOG.info('ProjectRegistry:_bootstrap', 'Creating an architect');
                owner = factory.newInstance('org.acme.project.bidding', 'Architect', 'email:a001');
                owner.firstName = 'Alex';
                owner.lastName = 'Best';
                owner.balance = 10000;

                // Create a new relationship for the owner
                let ownerRelation = factory.newRelationship('org.acme.project.bidding', 'Architect', 'email:a001');

                LOG.info('ProjectRegistry:_bootstrap', 'Creating a project #1');
                let project1 = factory.newInstance('org.acme.project.bidding', 'Project', 'id:p001');
                project1.owner = ownerRelation;

                LOG.info('ProjectRegistry:_bootstrap', 'Adding these to the project registry');
                return projectsRegistry.addAll([project1]);
            })
            .then(() => {
                return this.bizNetworkConnection.getParticipantRegistry('org.acme.project.bidding.Architect');
            })
            .then((architectRegistry) => {
                return architectRegistry.add(owner);
            })
            .then(() => {
                return this.bizNetworkConnection.getParticipantRegistry('org.acme.project.bidding.Contractor');
            })
            .then((contractorRegistry) => {
                LOG.info('ProjectRegistry:_bootstrap', 'Creating a contractor 1');
                let contractor1 = factory.newInstance('org.acme.project.bidding', 'Contractor', 'email:c001');
                contractor1.firstName = 'Chase';
                contractor1.lastName = 'Dash';
                contractor1.balance = 0;

                LOG.info('ProjectRegistry:_bootstrap', 'Creating a contractor 2');
                let contractor2 = factory.newInstance('org.acme.project.bidding', 'Contractor', 'email:c002');
                contractor2.firstName = 'Cyrus';
                contractor2.lastName = 'Daniel';
                contractor2.balance = 0;

                return contractorRegistry.addAll([contractor1, contractor2]);
            })
            .then(() => {
                return this.bizNetworkConnection.getAssetRegistry('org.acme.project.bidding.ProjectListing');
            })
            .then((projectListRegistry) => {
                LOG.info('ProjectRegistry:_bootstrap', 'Creating a project list 1');
                let listing1 = factory.newInstance('org.acme.project.bidding', 'ProjectListing', 'listing:l001');
                listing1.estimateCost = 5000;
                listing1.description = "SF House Renovation";
                listing1.state = "FOR_BIDDING";
                listing1.status = "GC_BIDDING";
                listing1.sector = "PRIVATE";
                listing1.buildingUse = "OFFICE";
                listing1.constructionType = "RENOVATION";
                let projectRelation = factory.newRelationship('org.acme.project.bidding', 'Project', 'id:p001');
                listing1.project = projectRelation;

                return projectListRegistry.addAll([listing1]);
            })
            .catch(function (error) {
                console.log(error);
                LOG.error('ProjectRegistry:_bootstrap', error);
                throw error;
            });
    }
}

const app = new App();
app.init()
    .then(() => {
        app.bootstrap();
    });
