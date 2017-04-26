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
            .catch((error) => {
                throw error;
            });
    }

    bootstrap() {
        LOG.info('ProjectRegistry:_bootstrap', 'getting asset registry for "org.acme.project.bidding.Project"');
        let factory = this.businessNetworkDefinition.getFactory();;
        let owner, owner2;
        return this.bizNetworkConnection.getAssetRegistry('org.acme.project.bidding.Project')
            .then((projectsRegistry) => {
                LOG.info('ProjectRegistry:_bootstrap', 'getting factory and adding assets');
                
                LOG.info('ProjectRegistry:_bootstrap', 'Creating an architect 1');
                owner = factory.newInstance('org.acme.project.bidding', 'Architect', 'email:a001');
                owner.firstName = 'Anthony';
                owner.lastName = 'Atkison';
                owner.balance = 50000;

                // Create a new relationship for the owner
                let ownerRelation = factory.newRelationship('org.acme.project.bidding', 'Architect', 'email:a001');

                LOG.info('ProjectRegistry:_bootstrap', 'Creating a project #1');
                let project1 = factory.newInstance('org.acme.project.bidding', 'Project', 'id:p001');
                project1.owner = ownerRelation;

                LOG.info('ProjectRegistry:_bootstrap', 'Creating an architect 2');
                owner2 = factory.newInstance('org.acme.project.bidding', 'Architect', 'email:a002');
                owner2.firstName = 'James';
                owner2.lastName = 'Prestwood';
                owner2.balance = 50000;

                // Create a new relationship for the owner
                let ownerRelation2 = factory.newRelationship('org.acme.project.bidding', 'Architect', 'email:a002');

                LOG.info('ProjectRegistry:_bootstrap', 'Creating a project #2');
                let project2 = factory.newInstance('org.acme.project.bidding', 'Project', 'id:p002');
                project2.owner = ownerRelation2;

                LOG.info('ProjectRegistry:_bootstrap', 'Adding these to the project registry');
                return projectsRegistry.addAll([project1, project2]);
            })
            .then(() => {
                return this.bizNetworkConnection.getParticipantRegistry('org.acme.project.bidding.Architect');
            })
            .then((architectRegistry) => {
                return architectRegistry.addAll([owner, owner2]);
            })
            .then(() => {
                return this.bizNetworkConnection.getParticipantRegistry('org.acme.project.bidding.Contractor');
            })
            .then((contractorRegistry) => {
                LOG.info('ProjectRegistry:_bootstrap', 'Creating a contractor 1');
                let contractor1 = factory.newInstance('org.acme.project.bidding', 'Contractor', 'email:c001');
                contractor1.firstName = 'Don';
                contractor1.lastName = 'Rushin';
                contractor1.balance = 0;

                LOG.info('ProjectRegistry:_bootstrap', 'Creating a contractor 2');
                let contractor2 = factory.newInstance('org.acme.project.bidding', 'Contractor', 'email:c002');
                contractor2.firstName = 'Nathan';
                contractor2.lastName = 'Rolle';
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
                listing1.description = "Landmark Office Renovation";
                listing1.state = "FOR_BIDDING";
                listing1.status = "GC_BIDDING";
                listing1.sector = "PUBLIC_STATE";
                listing1.buildingUse = "OFFICE";
                listing1.constructionType = "RENOVATION";
                let projectRelation2 = factory.newRelationship('org.acme.project.bidding', 'Project', 'id:p001');
                listing1.project = projectRelation2;

                LOG.info('ProjectRegistry:_bootstrap', 'Creating a project list 2');
                let listing2 = factory.newInstance('org.acme.project.bidding', 'ProjectListing', 'listing:l002');
                listing2.estimateCost = 10000;
                listing2.description = "SF Hotel Renovation";
                listing2.state = "FOR_BIDDING";
                listing2.status = "GC_BIDDING";
                listing2.sector = "PRIVATE";
                listing2.buildingUse = "HOTEL";
                listing2.constructionType = "RENOVATION";
                let projectRelation = factory.newRelationship('org.acme.project.bidding', 'Project', 'id:p002');
                listing2.project = projectRelation;

                return projectListRegistry.addAll([listing1, listing2]);
            })
            .then(() => {
                LOG.info('ProjectRegistry:_bootstrap', 'Done');
            })
            .catch((error) => {
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
